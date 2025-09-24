class RainbowTrail {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.trails = [];
        this.particles = [];
        this.isActive = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.mouseVelocity = { x: 0, y: 0 };
    }

    init() {
        this.createCanvas();
        this.attachEventListeners();
        this.isActive = true;
        this.animate();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'rainbow-trail-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    attachEventListeners() {
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('resize', () => this.handleResize());
    }

    handleMouseMove(event) {
        if (!this.isActive) return;

        const currentPos = { x: event.clientX, y: event.clientY };

        this.mouseVelocity.x = currentPos.x - this.lastMousePos.x;
        this.mouseVelocity.y = currentPos.y - this.lastMousePos.y;

        const speed = Math.sqrt(this.mouseVelocity.x ** 2 + this.mouseVelocity.y ** 2);

        const hoveredDay = document.elementFromPoint(event.clientX, event.clientY);
        let hue = this.getHueFromPosition(event.clientX, event.clientY);

        if (hoveredDay && hoveredDay.classList.contains('calendar__day')) {
            const bgColor = window.getComputedStyle(hoveredDay).backgroundColor;
            const hslMatch = bgColor.match(/hsl\((\d+)/);
            if (hslMatch) {
                hue = parseInt(hslMatch[1]);
            }
        }

        this.trails.push({
            x: currentPos.x,
            y: currentPos.y,
            hue: hue,
            saturation: 70,
            lightness: 50,
            size: 3 + speed * 0.2,
            life: 1.0
        });

        if (speed > 15) {
            for (let i = 0; i < 3; i++) {
                this.createStarParticle(currentPos.x, currentPos.y);
            }
        }

        if (this.trails.length > 100) {
            this.trails.shift();
        }

        this.lastMousePos = currentPos;
    }

    getHueFromPosition(x, y) {
        const time = Date.now() * 0.001;
        return (x / window.innerWidth * 360 + y / window.innerHeight * 360 + time * 50) % 360;
    }

    createStarParticle(x, y) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 3;

        this.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            size: Math.random() * 3 + 1,
            hue: Math.random() * 360,
            life: 1.0
        });
    }

    animate() {
        if (!this.isActive) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.globalCompositeOperation = 'lighter';

        this.drawTrails();
        this.drawParticles();
        this.updateParticles();

        requestAnimationFrame(() => this.animate());
    }

    drawTrails() {
        if (this.trails.length < 2) return;

        for (let i = 1; i < this.trails.length; i++) {
            const prevPoint = this.trails[i - 1];
            const point = this.trails[i];

            const gradient = this.ctx.createLinearGradient(
                prevPoint.x, prevPoint.y,
                point.x, point.y
            );

            gradient.addColorStop(0, `hsla(${prevPoint.hue}, ${prevPoint.saturation}%, ${prevPoint.lightness}%, ${prevPoint.life * 0.8})`);
            gradient.addColorStop(1, `hsla(${point.hue}, ${point.saturation}%, ${point.lightness}%, ${point.life * 0.8})`);

            this.ctx.beginPath();
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = point.size;
            this.ctx.lineCap = 'round';
            this.ctx.moveTo(prevPoint.x, prevPoint.y);
            this.ctx.lineTo(point.x, point.y);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = `hsl(${point.hue}, 100%, 50%)`;
            this.ctx.fillStyle = `hsla(${point.hue}, 100%, 70%, ${point.life * 0.3})`;
            this.ctx.arc(point.x, point.y, point.size * 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            point.life -= 0.02;
        }

        this.trails = this.trails.filter(trail => trail.life > 0);
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);

            const starPoints = 5;
            const outerRadius = particle.size * 2;
            const innerRadius = particle.size;

            this.ctx.beginPath();
            for (let i = 0; i < starPoints * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i / (starPoints * 2)) * Math.PI * 2 - Math.PI / 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();

            this.ctx.fillStyle = `hsla(${particle.hue}, 100%, 70%, ${particle.life})`;
            this.ctx.fill();

            this.ctx.strokeStyle = `hsla(${particle.hue}, 100%, 90%, ${particle.life * 0.5})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();

            this.ctx.restore();
        });
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1;
            particle.life -= 0.03;
            particle.size *= 0.98;

            return particle.life > 0 && particle.size > 0.1;
        });
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    destroy() {
        this.isActive = false;
        if (this.canvas) {
            this.canvas.remove();
        }
    }
}

class TimeMachine {
    constructor() {
        this.isAnimating = false;
        this.months = [];
    }

    init() {
        this.createButton();
        this.collectMonths();
    }

    createButton() {
        const button = document.createElement('button');
        button.id = 'time-machine-btn';
        button.className = 'time-machine-btn';
        button.innerHTML = '⏰ 时光机';
        button.addEventListener('click', () => this.activate());

        const header = document.querySelector('.calendar__header');
        if (header) {
            header.appendChild(button);
        }
    }

    collectMonths() {
        this.months = Array.from(document.querySelectorAll('.calendar__month'));
    }

    activate() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        this.playSound();
        this.applyVintageFilter();
        this.animateCalendarFlip();
        this.animateClock();
    }

    applyVintageFilter() {
        const filter = document.createElement('div');
        filter.className = 'vintage-filter';
        filter.style.position = 'fixed';
        filter.style.top = '0';
        filter.style.left = '0';
        filter.style.width = '100%';
        filter.style.height = '100%';
        filter.style.pointerEvents = 'none';
        filter.style.zIndex = '9998';
        filter.style.background = 'rgba(0, 0, 0, 0.3)';
        filter.style.mixBlendMode = 'multiply';

        const noise = document.createElement('div');
        noise.className = 'vintage-noise';
        noise.style.position = 'absolute';
        noise.style.width = '100%';
        noise.style.height = '100%';
        noise.style.opacity = '0.1';
        noise.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`;

        filter.appendChild(noise);
        document.body.appendChild(filter);

        gsap.to(filter, {
            opacity: 0,
            duration: 0.5,
            delay: 3,
            onComplete: () => filter.remove()
        });

        document.body.style.filter = 'sepia(0.5) contrast(1.2) brightness(0.9)';

        setTimeout(() => {
            gsap.to(document.body, {
                filter: 'sepia(0) contrast(1) brightness(1)',
                duration: 1,
                ease: 'power2.inOut'
            });
        }, 3000);
    }

    animateCalendarFlip() {
        const timeline = gsap.timeline({
            onComplete: () => {
                this.isAnimating = false;
                this.months.forEach(month => {
                    month.style.transformStyle = '';
                });
            }
        });

        this.months.forEach((month, index) => {
            month.style.transformStyle = 'preserve-3d';
            month.style.transformOrigin = 'center left';

            timeline.to(month, {
                rotationY: -180,
                duration: 0.4,
                ease: 'power2.in',
                onComplete: function() {
                    gsap.set(this.targets()[0], { rotationY: 180 });
                }
            }, index * 0.05)
            .to(month, {
                rotationY: 0,
                duration: 0.4,
                ease: 'power2.out'
            }, index * 0.05 + 0.4);
        });

        timeline.timeScale(2);
    }

    animateClock() {
        const clock = document.createElement('div');
        clock.className = 'time-machine-clock';
        clock.innerHTML = `
            <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="58" fill="none" stroke="#6366f1" stroke-width="2"/>
                <line class="clock-hand clock-hand--hour" x1="60" y1="60" x2="60" y2="30" stroke="#6366f1" stroke-width="3" stroke-linecap="round"/>
                <line class="clock-hand clock-hand--minute" x1="60" y1="60" x2="60" y2="20" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round"/>
                <circle cx="60" cy="60" r="3" fill="#6366f1"/>
            </svg>
        `;
        clock.style.position = 'fixed';
        clock.style.bottom = '20px';
        clock.style.right = '20px';
        clock.style.zIndex = '10000';
        document.body.appendChild(clock);

        const hourHand = clock.querySelector('.clock-hand--hour');
        const minuteHand = clock.querySelector('.clock-hand--minute');

        gsap.set([hourHand, minuteHand], { transformOrigin: '60px 60px' });

        gsap.to(hourHand, {
            rotation: -720,
            duration: 2,
            ease: 'power2.inOut'
        });

        gsap.to(minuteHand, {
            rotation: -2880,
            duration: 2,
            ease: 'power2.inOut'
        });

        gsap.to(clock, {
            scale: 0,
            opacity: 0,
            duration: 0.5,
            delay: 2.5,
            ease: 'back.in(1.7)',
            onComplete: () => clock.remove()
        });
    }

    playSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        const duration = 0.05;
        const frequency = 200;

        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency + Math.random() * 100;
                oscillator.type = 'square';

                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            }, i * 100);
        }
    }
}

window.CalendarEffects = {
    RainbowTrail,
    TimeMachine
};
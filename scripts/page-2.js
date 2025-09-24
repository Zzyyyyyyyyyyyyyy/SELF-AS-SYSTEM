/**
 * Page 2 - Features Page Animations
 * GSAP Timeline animations for bento grid and features
 */

// ==========================================
// GSAP ANIMATIONS
// ==========================================

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// FEATURES HERO ANIMATIONS
// ==========================================

function initFeaturesHero() {
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    timeline.from('.features-hero__label', {
        y: 30,
        opacity: 0,
        duration: 0.8
    });

    timeline.from('.features-hero__title', {
        y: 40,
        opacity: 0,
        duration: 0.8
    }, '-=0.4');

    timeline.from('.features-hero__subtitle', {
        y: 30,
        opacity: 0,
        duration: 0.8
    }, '-=0.4');
}

// ==========================================
// BENTO CARD ANIMATIONS
// ==========================================

function initBentoCards() {
    // Stagger animation for bento cards
    gsap.from('.bento-card', {
        scrollTrigger: {
            trigger: '.bento-grid',
            start: 'top 75%',
            end: 'bottom 25%',
            toggleActions: 'play none none reverse'
        },
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: {
            amount: 0.8,
            from: 'start',
            ease: 'power2.out'
        },
        ease: 'power3.out'
    });

    // Individual card interactions
    document.querySelectorAll('.bento-card').forEach(card => {
        const icon = card.querySelector('.bento-card__icon');
        const glow = card.querySelector('.bento-card__glow');

        // Hover animations
        card.addEventListener('mouseenter', () => {
            gsap.to(icon, {
                scale: 1.1,
                rotation: 5,
                duration: 0.3,
                ease: 'back.out(1.7)'
            });

            gsap.to(glow, {
                opacity: 1,
                scale: 1.1,
                duration: 0.5
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(icon, {
                scale: 1,
                rotation: 0,
                duration: 0.3,
                ease: 'power2.out'
            });

            gsap.to(glow, {
                opacity: 0,
                scale: 1,
                duration: 0.5
            });
        });

        // Parallax effect on mouse move
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;

            gsap.to(card, {
                rotateX: deltaY * -5,
                rotateY: deltaX * 5,
                duration: 0.3,
                transformPerspective: 1000,
                ease: 'power2.out'
            });

            gsap.to(glow, {
                x: deltaX * 30,
                y: deltaY * 30,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    });
}

// ==========================================
// PROGRESS RING ANIMATION
// ==========================================

function initProgressRings() {
    document.querySelectorAll('.progress-ring').forEach(ring => {
        const circle = ring.querySelector('.progress-ring__circle');
        const progress = parseInt(ring.getAttribute('data-progress'));
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progress / 100) * circumference;

        // Create SVG gradient
        const svg = ring.querySelector('.progress-ring__svg');
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'gradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('style', 'stop-color:#6366f1;stop-opacity:1');

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('style', 'stop-color:#8b5cf6;stop-opacity:1');

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.insertBefore(defs, svg.firstChild);

        // Animate on scroll
        gsap.to(circle, {
            scrollTrigger: {
                trigger: ring,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            strokeDashoffset: offset,
            duration: 1.5,
            ease: 'power2.out'
        });
    });
}

// ==========================================
// CHART ANIMATIONS
// ==========================================

function initCharts() {
    document.querySelectorAll('.mini-chart').forEach(chart => {
        const bars = chart.querySelectorAll('.mini-chart__bar');

        gsap.from(bars, {
            scrollTrigger: {
                trigger: chart,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            scaleY: 0,
            transformOrigin: 'bottom',
            duration: 0.8,
            stagger: 0.1,
            ease: 'back.out(1.7)'
        });

        // Continuous animation
        bars.forEach((bar, index) => {
            gsap.to(bar, {
                scaleY: 1.1,
                duration: 0.5 + (index * 0.1),
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
                delay: index * 0.2
            });
        });
    });
}

// ==========================================
// TECHNOLOGIES MARQUEE
// ==========================================

function initMarquee() {
    const track = document.getElementById('techTrack');

    if (track) {
        // Duplicate content for seamless loop
        const trackContent = track.innerHTML;
        track.innerHTML += trackContent;

        // GSAP infinite scroll
        const badges = track.querySelectorAll('.tech-badge');
        const totalWidth = Array.from(badges).slice(0, badges.length / 2).reduce((acc, badge) => {
            return acc + badge.offsetWidth + 16; // 16px gap
        }, 0);

        gsap.to(track, {
            x: -totalWidth,
            duration: 30,
            ease: 'none',
            repeat: -1
        });

        // Hover to slow down
        track.addEventListener('mouseenter', () => {
            gsap.to(track, {
                timeScale: 0.3,
                duration: 0.5
            });
        });

        track.addEventListener('mouseleave', () => {
            gsap.to(track, {
                timeScale: 1,
                duration: 0.5
            });
        });
    }
}

// ==========================================
// RIPPLE EFFECT ANIMATION
// ==========================================

function initRippleEffect() {
    const ripple = document.querySelector('.features-hero__ripple');

    if (ripple) {
        gsap.to(ripple, {
            scale: 1.5,
            opacity: 0,
            duration: 4,
            repeat: -1,
            ease: 'power1.out'
        });
    }
}

// ==========================================
// LIST ITEM ANIMATIONS
// ==========================================

function initListAnimations() {
    document.querySelectorAll('.bento-card__list').forEach(list => {
        const items = list.querySelectorAll('li');

        gsap.from(items, {
            scrollTrigger: {
                trigger: list,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            x: -30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out'
        });
    });
}

// ==========================================
// BACKGROUND EFFECTS
// ==========================================

function initBackgroundEffects() {
    // Parallax effect on scroll
    gsap.to('.features-hero__ripple', {
        scrollTrigger: {
            trigger: '.features-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        },
        y: 150,
        scale: 1.3,
        opacity: 0
    });
}

// ==========================================
// TECH BADGE INTERACTIONS
// ==========================================

function initTechBadges() {
    document.querySelectorAll('.tech-badge').forEach(badge => {
        badge.addEventListener('mouseenter', () => {
            gsap.to(badge, {
                scale: 1.1,
                y: -5,
                duration: 0.3,
                ease: 'back.out(1.7)'
            });
        });

        badge.addEventListener('mouseleave', () => {
            gsap.to(badge, {
                scale: 1,
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
}

// ==========================================
// INITIALIZE ALL ANIMATIONS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize hero
    initFeaturesHero();

    // Initialize bento cards
    initBentoCards();

    // Initialize progress rings
    initProgressRings();

    // Initialize charts
    initCharts();

    // Initialize marquee
    initMarquee();

    // Initialize ripple effect
    initRippleEffect();

    // Initialize list animations
    initListAnimations();

    // Initialize background effects
    initBackgroundEffects();

    // Initialize tech badges
    initTechBadges();

    // Page entrance animation
    gsap.from('body', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
    });
});
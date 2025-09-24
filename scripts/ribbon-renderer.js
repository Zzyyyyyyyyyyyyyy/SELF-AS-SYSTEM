class RibbonRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ribbons = [];
        this.intersections = [];
        this.intersectionCache = new Map();
        this.animationId = null;
        this.mousePos = { x: 0, y: 0 };

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    createRibbon(config) {
        const { id, type, position, color, width, videoData } = config;

        const controlPoints = this.generateControlPoints(type, position);

        return {
            id,
            type,
            position,
            controlPoints,
            color,
            width,
            videoData,
            phase: Math.random() * Math.PI * 2,
            waveOffset: Math.random() * 100
        };
    }

    generateControlPoints(type, position) {
        const points = [];
        const segments = 5;

        if (type === 'horizontal') {
            for (let i = 0; i <= segments; i++) {
                const x = (this.width / segments) * i;
                const baseY = position;
                const randomOffset = (Math.random() - 0.5) * 80;
                points.push({ x, y: baseY + randomOffset });
            }
        } else {
            for (let i = 0; i <= segments; i++) {
                const y = (this.height / segments) * i;
                const baseX = position;
                const randomOffset = (Math.random() - 0.5) * 100;
                points.push({ x: baseX + randomOffset, y });
            }
        }

        return points;
    }

    bezierCurve(points, t) {
        if (points.length === 1) return points[0];

        const newPoints = [];
        for (let i = 0; i < points.length - 1; i++) {
            const x = points[i].x + (points[i + 1].x - points[i].x) * t;
            const y = points[i].y + (points[i + 1].y - points[i].y) * t;
            newPoints.push({ x, y });
        }

        return this.bezierCurve(newPoints, t);
    }

    drawRibbon(ribbon, time) {
        const { controlPoints, color, width, phase, waveOffset, type } = ribbon;
        const colors = this.parseGradient(color);

        this.ctx.save();

        const animatedPoints = controlPoints.map((point, i) => {
            const waveX = type === 'vertical' ? Math.cos(time * 0.0008 + phase + i * 0.3) * 25 : 0;
            const waveY = type === 'horizontal' ? Math.sin(time * 0.001 + phase + i * 0.3) * 20 : 0;
            return {
                x: point.x + waveX,
                y: point.y + waveY
            };
        });

        this.ctx.beginPath();
        this.ctx.moveTo(animatedPoints[0].x, animatedPoints[0].y);

        for (let i = 0; i < animatedPoints.length - 1; i++) {
            const xc = (animatedPoints[i].x + animatedPoints[i + 1].x) / 2;
            const yc = (animatedPoints[i].y + animatedPoints[i + 1].y) / 2;
            this.ctx.quadraticCurveTo(animatedPoints[i].x, animatedPoints[i].y, xc, yc);
        }

        const lastPoint = animatedPoints[animatedPoints.length - 1];
        this.ctx.lineTo(lastPoint.x, lastPoint.y);

        const gradient = type === 'horizontal'
            ? this.ctx.createLinearGradient(0, 0, this.width, 0)
            : this.ctx.createLinearGradient(0, 0, 0, this.height);

        gradient.addColorStop(0, this.addAlpha(colors.start, 0.4));
        gradient.addColorStop(0.5, this.addAlpha(colors.end, 0.8));
        gradient.addColorStop(1, this.addAlpha(colors.start, 0.4));

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        const glowIntensity = 25 + Math.sin(time * 0.002 + phase) * 10;
        this.ctx.shadowBlur = glowIntensity;
        this.ctx.shadowColor = colors.start;

        this.ctx.stroke();

        this.ctx.globalAlpha = 0.3;
        this.ctx.lineWidth = width + 8;
        this.ctx.shadowBlur = 50;
        this.ctx.stroke();

        this.ctx.restore();

        ribbon.animatedPoints = animatedPoints;
    }

    findIntersections(time) {
        this.intersections = [];

        const horizontalRibbons = this.ribbons.filter(r => r.type === 'horizontal');
        const verticalRibbons = this.ribbons.filter(r => r.type === 'vertical');

        horizontalRibbons.forEach(hRibbon => {
            if (!hRibbon.animatedPoints) return;

            verticalRibbons.forEach(vRibbon => {
                if (!vRibbon.animatedPoints) return;

                const key = `${hRibbon.id}-${vRibbon.id}`;

                let closestIntersection = null;
                let minDistance = Infinity;

                for (let t1 = 0; t1 <= 1; t1 += 0.05) {
                    const hPoint = this.bezierCurve(hRibbon.animatedPoints, t1);

                    for (let t2 = 0; t2 <= 1; t2 += 0.05) {
                        const vPoint = this.bezierCurve(vRibbon.animatedPoints, t2);

                        const distance = Math.sqrt(
                            Math.pow(hPoint.x - vPoint.x, 2) +
                            Math.pow(hPoint.y - vPoint.y, 2)
                        );

                        if (distance < minDistance) {
                            minDistance = distance;
                            closestIntersection = {
                                targetX: (hPoint.x + vPoint.x) / 2,
                                targetY: (hPoint.y + vPoint.y) / 2,
                                color1: hRibbon.color,
                                color2: vRibbon.color,
                                ribbons: [hRibbon, vRibbon],
                                strength: Math.max(0.6, 1 - (distance / 80))
                            };
                        }
                    }
                }

                if (closestIntersection && minDistance < 80) {
                    const cached = this.intersectionCache.get(key);

                    if (cached) {
                        const smoothing = 0.15;
                        closestIntersection.x = cached.x + (closestIntersection.targetX - cached.x) * smoothing;
                        closestIntersection.y = cached.y + (closestIntersection.targetY - cached.y) * smoothing;
                    } else {
                        closestIntersection.x = closestIntersection.targetX;
                        closestIntersection.y = closestIntersection.targetY;
                    }

                    this.intersectionCache.set(key, {
                        x: closestIntersection.x,
                        y: closestIntersection.y
                    });

                    this.intersections.push(closestIntersection);
                }
            });
        });
    }

    drawIntersections(time) {
        this.intersections.forEach((intersection, i) => {
            const { x, y, color1, color2, strength } = intersection;
            const colors1 = this.parseGradient(color1);
            const colors2 = this.parseGradient(color2);

            const pulsePhase = time * 0.003 + i * 0.15;
            const pulseSize = 12 + Math.sin(pulsePhase) * 5;
            const pulseAlpha = 0.85 + Math.sin(pulsePhase) * 0.15;

            this.ctx.save();

            const outerGlow = this.ctx.createRadialGradient(x, y, 0, x, y, pulseSize * 3);
            outerGlow.addColorStop(0, this.addAlpha(colors1.end, pulseAlpha * 0.6));
            outerGlow.addColorStop(0.3, this.addAlpha(colors2.start, pulseAlpha * 0.4));
            outerGlow.addColorStop(1, 'transparent');

            this.ctx.fillStyle = outerGlow;
            this.ctx.shadowBlur = 50;
            this.ctx.shadowColor = colors1.end;
            this.ctx.beginPath();
            this.ctx.arc(x, y, pulseSize * 2, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.globalAlpha = pulseAlpha;
            const sparkleGradient = this.ctx.createRadialGradient(x, y, 0, x, y, pulseSize * 1.5);
            sparkleGradient.addColorStop(0, colors2.end);
            sparkleGradient.addColorStop(0.5, colors1.start);
            sparkleGradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = sparkleGradient;
            this.ctx.shadowBlur = 40;
            this.ctx.shadowColor = colors2.end;
            this.ctx.beginPath();
            this.ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, pulseSize * 0.35, 0, Math.PI * 2);
            this.ctx.fill();

            if (Math.sin(pulsePhase * 2) > 0.7) {
                this.ctx.globalAlpha = 0.8;
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(x, y, pulseSize * 1.2, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            this.ctx.restore();
        });
    }

    parseGradient(gradientString) {
        const match = gradientString.match(/#[0-9a-f]{6}/gi);
        if (match && match.length >= 2) {
            return { start: match[0], end: match[1] };
        }
        return { start: '#6366f1', end: '#8b5cf6' };
    }

    addAlpha(hexColor, alpha) {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;

        let foundIntersection = null;
        let minDistance = Infinity;

        for (let intersection of this.intersections) {
            const dx = this.mousePos.x - intersection.x;
            const dy = this.mousePos.y - intersection.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 40 && distance < minDistance) {
                minDistance = distance;
                foundIntersection = intersection;
            }
        }

        if (foundIntersection) {
            const event = new CustomEvent('ribbonHover', {
                detail: {
                    ribbons: foundIntersection.ribbons,
                    x: e.clientX,
                    y: e.clientY
                }
            });
            this.canvas.dispatchEvent(event);
        } else {
            const event = new CustomEvent('ribbonHover', { detail: null });
            this.canvas.dispatchEvent(event);
        }
    }

    render(time) {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ribbons.forEach(ribbon => {
            this.drawRibbon(ribbon, time);
        });

        this.findIntersections(time);
        this.drawIntersections(time);

        this.animationId = requestAnimationFrame((t) => this.render(t));
    }

    addRibbon(config) {
        const ribbon = this.createRibbon(config);
        this.ribbons.push(ribbon);
        return ribbon;
    }

    start() {
        if (!this.animationId) {
            this.render(0);
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

window.RibbonRenderer = RibbonRenderer;
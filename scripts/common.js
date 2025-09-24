/**
 * Common JavaScript utilities and navigation
 * Shared across all pages
 */

// ==========================================
// NAVIGATION FUNCTIONALITY
// ==========================================

class Navigation {
    constructor() {
        this.nav = document.querySelector('.nav');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav__link');

        this.init();
    }

    init() {
        // Scroll effect
        this.handleScroll();
        window.addEventListener('scroll', () => this.handleScroll());

        // Mobile toggle
        if (this.navToggle && this.navMenu) {
            this.navToggle.addEventListener('click', () => this.toggleMenu());
        }

        // Close menu on link click (mobile)
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!this.nav.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    handleScroll() {
        if (window.scrollY > 50) {
            this.nav.classList.add('nav--scrolled');
        } else {
            this.nav.classList.remove('nav--scrolled');
        }
    }

    toggleMenu() {
        this.navToggle.classList.toggle('nav__toggle--active');
        this.navMenu.classList.toggle('nav__menu--active');
    }

    closeMenu() {
        this.navToggle?.classList.remove('nav__toggle--active');
        this.navMenu?.classList.remove('nav__menu--active');
    }
}

// ==========================================
// PARTICLE SYSTEM
// ==========================================

class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.particleCount = 50;

        if (this.container) {
            this.init();
        }
    }

    init() {
        // Create particles
        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const size = Math.random() * 4 + 2;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;

        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.8), transparent);
            border-radius: 50%;
            left: ${x}%;
            top: ${y}%;
            opacity: ${Math.random() * 0.5 + 0.3};
            animation: float ${duration}s ease-in-out ${delay}s infinite;
        `;

        this.container.appendChild(particle);
        this.particles.push(particle);
    }
}

// ==========================================
// NUMBER COUNTER ANIMATION
// ==========================================

class NumberCounter {
    constructor(element, target, duration = 2000) {
        this.element = element;
        this.target = target;
        this.duration = duration;
        this.hasAnimated = false;
    }

    animate() {
        if (this.hasAnimated) return;

        const start = 0;
        const increment = this.target / (this.duration / 16);
        let current = start;

        const updateCounter = () => {
            current += increment;
            if (current < this.target) {
                this.element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                this.element.textContent = this.target;
                this.hasAnimated = true;
            }
        };

        updateCounter();
    }
}

// ==========================================
// INTERSECTION OBSERVER UTILITY
// ==========================================

class ScrollObserver {
    constructor(elements, callback, options = {}) {
        this.elements = typeof elements === 'string'
            ? document.querySelectorAll(elements)
            : elements;
        this.callback = callback;
        this.options = {
            threshold: 0.1,
            rootMargin: '0px',
            ...options
        };

        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.callback(entry.target);
                }
            });
        }, this.options);

        this.elements.forEach(element => {
            observer.observe(element);
        });
    }
}

// ==========================================
// SMOOTH SCROLL
// ==========================================

class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

const Utils = {
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Get random number in range
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Linear interpolation
    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }
};

// ==========================================
// INITIALIZE ON DOM READY
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    new Navigation();

    // Initialize smooth scroll
    new SmoothScroll();

    // Add CSS for particles if not exists
    if (!document.getElementById('particle-styles')) {
        const style = document.createElement('style');
        style.id = 'particle-styles';
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0) translateX(0); }
                25% { transform: translateY(-20px) translateX(10px); }
                50% { transform: translateY(-40px) translateX(-10px); }
                75% { transform: translateY(-20px) translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }
});

// Export for use in other scripts
window.Utils = Utils;
window.NumberCounter = NumberCounter;
window.ParticleSystem = ParticleSystem;
window.ScrollObserver = ScrollObserver;
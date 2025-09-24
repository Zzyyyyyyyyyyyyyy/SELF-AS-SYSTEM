/**
 * Page 3 - Contact Page Animations
 * GSAP Timeline animations and form interactions
 */

// ==========================================
// GSAP ANIMATIONS
// ==========================================

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// CONTACT HERO ANIMATIONS
// ==========================================

function initContactHero() {
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    timeline.from('.contact-hero__label', {
        y: 30,
        opacity: 0,
        duration: 0.8
    });

    timeline.from('.contact-hero__title', {
        y: 40,
        opacity: 0,
        duration: 0.8
    }, '-=0.4');

    timeline.from('.contact-hero__subtitle', {
        y: 30,
        opacity: 0,
        duration: 0.8
    }, '-=0.4');
}

// ==========================================
// AURORA BACKGROUND ANIMATION
// ==========================================

function initAuroraEffect() {
    const aurora = document.querySelector('.contact-hero__aurora');

    if (aurora) {
        gsap.to(aurora, {
            background: `
                radial-gradient(ellipse at top, rgba(139, 92, 246, 0.2), transparent 50%),
                radial-gradient(ellipse at bottom, rgba(99, 102, 241, 0.2), transparent 50%)
            `,
            duration: 8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }
}

// ==========================================
// FORM ANIMATIONS
// ==========================================

function initFormAnimations() {
    // Entrance animation
    gsap.from('.contact-form', {
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        },
        x: -60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });

    // Form group animations
    const formGroups = document.querySelectorAll('.form-group');

    gsap.from(formGroups, {
        scrollTrigger: {
            trigger: '.contact-form',
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
    });

    // Input focus animations
    formGroups.forEach(group => {
        const input = group.querySelector('.form-group__input, .form-group__textarea');
        const label = group.querySelector('.form-group__label');
        const border = group.querySelector('.form-group__border');

        if (input && label && border) {
            input.addEventListener('focus', () => {
                gsap.to(label, {
                    color: '#6366f1',
                    y: -3,
                    duration: 0.3,
                    ease: 'power2.out'
                });

                gsap.to(border, {
                    opacity: 1,
                    scaleX: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            input.addEventListener('blur', () => {
                if (!input.value) {
                    gsap.to(label, {
                        color: '#a1a1aa',
                        y: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }

                gsap.to(border, {
                    opacity: 0,
                    scaleX: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        }
    });
}

// ==========================================
// INFO CARDS ANIMATIONS
// ==========================================

function initInfoCards() {
    gsap.from('.info-card', {
        scrollTrigger: {
            trigger: '.contact__info',
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        },
        x: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
    });

    // Card interactions
    document.querySelectorAll('.info-card').forEach(card => {
        const icon = card.querySelector('.info-card__icon');
        const glow = card.querySelector('.info-card__glow');

        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                x: 10,
                duration: 0.3,
                ease: 'power2.out'
            });

            gsap.to(icon, {
                scale: 1.15,
                rotation: 5,
                duration: 0.3,
                ease: 'back.out(1.7)'
            });

            gsap.to(glow, {
                opacity: 1,
                scale: 1.2,
                duration: 0.5
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                x: 0,
                duration: 0.3,
                ease: 'power2.out'
            });

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
    });
}

// ==========================================
// SOCIAL LINKS ANIMATIONS
// ==========================================

function initSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-link');

    socialLinks.forEach((link, index) => {
        link.addEventListener('mouseenter', () => {
            gsap.to(link, {
                y: -5,
                scale: 1.1,
                duration: 0.3,
                ease: 'back.out(1.7)'
            });

            // Ripple effect
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                inset: 0;
                border-radius: inherit;
                background: radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent);
                animation: social-ripple 0.6s ease-out;
                pointer-events: none;
            `;
            link.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });

        link.addEventListener('mouseleave', () => {
            gsap.to(link, {
                y: 0,
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });

    // Add ripple animation
    if (!document.getElementById('social-ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'social-ripple-styles';
        style.textContent = `
            @keyframes social-ripple {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ==========================================
// FORM SUBMISSION
// ==========================================

function initFormSubmission() {
    const form = document.getElementById('contactForm');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = form.querySelector('button[type="submit"]');
            const buttonText = submitButton.querySelector('.btn__text');
            const originalText = buttonText.textContent;

            // Disable button and show loading
            submitButton.disabled = true;
            buttonText.textContent = 'Sending...';

            // Animate button
            gsap.to(submitButton, {
                scale: 0.95,
                duration: 0.2
            });

            // Simulate form submission (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Success animation
            gsap.to(submitButton, {
                scale: 1,
                duration: 0.3,
                ease: 'back.out(1.7)'
            });

            buttonText.textContent = 'Message Sent!';

            // Show success message
            showSuccessMessage();

            // Reset form
            setTimeout(() => {
                form.reset();
                buttonText.textContent = originalText;
                submitButton.disabled = false;
            }, 3000);
        });
    }
}

// ==========================================
// SUCCESS MESSAGE
// ==========================================

function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <div class="success-message__content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="22 4 12 14.01 9 11.01" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Thank you! We'll be in touch soon.</span>
        </div>
    `;

    message.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        z-index: 10000;
        opacity: 0;
        transform: translateY(20px);
    `;

    document.body.appendChild(message);

    // Animate in
    gsap.to(message, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'back.out(1.7)'
    });

    // Animate out
    gsap.to(message, {
        opacity: 0,
        y: -20,
        duration: 0.5,
        delay: 3,
        ease: 'power2.in',
        onComplete: () => message.remove()
    });

    // Add styles for success message
    if (!document.getElementById('success-message-styles')) {
        const style = document.createElement('style');
        style.id = 'success-message-styles';
        style.textContent = `
            .success-message__content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }
}

// ==========================================
// INPUT VALIDATION ANIMATIONS
// ==========================================

function initInputValidation() {
    const inputs = document.querySelectorAll('.form-group__input, .form-group__textarea');

    inputs.forEach(input => {
        input.addEventListener('invalid', (e) => {
            e.preventDefault();

            const formGroup = input.closest('.form-group');

            gsap.to(formGroup, {
                x: -10,
                duration: 0.1,
                repeat: 3,
                yoyo: true,
                ease: 'power2.out'
            });

            gsap.to(input, {
                borderColor: '#ef4444',
                duration: 0.3
            });
        });

        input.addEventListener('input', () => {
            if (input.validity.valid) {
                gsap.to(input, {
                    borderColor: '#6366f1',
                    duration: 0.3
                });
            }
        });
    });
}

// ==========================================
// PARALLAX SCROLL EFFECT
// ==========================================

function initParallaxEffects() {
    gsap.to('.contact-hero__aurora', {
        scrollTrigger: {
            trigger: '.contact-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        },
        y: 100,
        scale: 1.2,
        opacity: 0.5
    });
}

// ==========================================
// INITIALIZE ALL ANIMATIONS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize hero
    initContactHero();

    // Initialize aurora effect
    initAuroraEffect();

    // Initialize form animations
    initFormAnimations();

    // Initialize info cards
    initInfoCards();

    // Initialize social links
    initSocialLinks();

    // Initialize form submission
    initFormSubmission();

    // Initialize input validation
    initInputValidation();

    // Initialize parallax effects
    initParallaxEffects();

    // Page entrance animation
    gsap.from('body', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
    });
});
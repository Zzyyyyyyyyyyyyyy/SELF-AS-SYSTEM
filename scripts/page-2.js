document.addEventListener('DOMContentLoaded', () => {
    gsap.from('body', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
    });
});
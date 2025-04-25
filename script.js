document.querySelectorAll('.neon-btn').forEach((btn, index) => {
  gsap.fromTo(btn, 
    { opacity: 0, y: 20 }, 
    { opacity: 1, y: 0, duration: 1, delay: index * 0.2, ease: "power2.out" }
  );
});

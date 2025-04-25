class RadioButtonEffect {
  constructor(groups) {
    this.groups = groups;
    this.init();
  }

  init() {
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
      radio.addEventListener("change", () => {
        this.animateEffect(radio);
      });
    });
  }

  animateEffect(radio) {
    const label = radio.nextElementSibling;
    if (!label) return;
    gsap.fromTo(label, {
      scale: 0.95,
      opacity: 0.7
    }, {
      scale: 1.1,
      opacity: 1,
      duration: 0.4,
      ease: "elastic.out(1, 0.4)"
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new RadioButtonEffect();
});

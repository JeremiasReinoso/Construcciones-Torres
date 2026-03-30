(() => {
  const revealItems = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );
  revealItems.forEach((item) => revealObserver.observe(item));

  const revealTextElements = document.querySelectorAll(".reveal-text");
  revealTextElements.forEach((el) => {
    const delay = parseInt(el.dataset.delay) || 0;
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.8s ease " + delay + "ms, transform 0.8s ease " + delay + "ms";
    const textObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          textObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    textObserver.observe(el);
  });

  const initWordReveal = () => {
    const wordRevealElements = document.querySelectorAll(".word-reveal");
    if (wordRevealElements.length === 0) return;
    wordRevealElements.forEach((el) => {
      const text = el.textContent.trim();
      const words = text.split(" ");
      el.innerHTML = words.map(word => "<span class='word'>" + word + "</span>").join(" ");
    });
    const wordObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const words = entry.target.querySelectorAll(".word");
            words.forEach((word, i) => {
              word.style.transitionDelay = (i * 0.08) + "s";
            });
            entry.target.classList.add("is-visible");
            wordObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    wordRevealElements.forEach((el) => wordObserver.observe(el));
  };
  initWordReveal();

  const initHeroSlider = () => {
    const slider = document.getElementById("heroSlider");
    if (!slider) return;
    const slides = slider.querySelectorAll(".slide");
    if (slides.length <= 1) return;
    let currentIndex = 0;
    slides[currentIndex].classList.add("active");
    setInterval(() => {
      slides[currentIndex].classList.remove("active");
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add("active");
    }, 4000);
  };
  initHeroSlider();
})();

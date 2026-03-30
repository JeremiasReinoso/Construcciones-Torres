(() => {
  const revealItems = document.querySelectorAll(".reveal");
  const counters = document.querySelectorAll(".stat-number");
  const parallaxContainer = document.querySelector("[data-parallax-container]");
  const depthLayers = document.querySelectorAll("[data-depth]");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -30px 0px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const animateCounter = (counter) => {
    const target = Number(counter.dataset.target || 0);
    const prefix = counter.dataset.prefix || "";
    const suffix = counter.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      counter.textContent = `${prefix}${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  };

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.45 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  if (parallaxContainer && depthLayers.length > 0 && window.matchMedia("(pointer:fine)").matches) {
    const onMove = (event) => {
      const rect = parallaxContainer.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (event.clientX - centerX) / rect.width;
      const y = (event.clientY - centerY) / rect.height;

      depthLayers.forEach((layer) => {
        const depth = Number(layer.dataset.depth || 0);
        const tx = -(x * depth);
        const ty = -(y * depth);
        layer.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });
    };

    const resetLayers = () => {
      depthLayers.forEach((layer) => {
        layer.style.transform = "translate3d(0, 0, 0)";
      });
    };

    parallaxContainer.addEventListener("mousemove", onMove);
    parallaxContainer.addEventListener("mouseleave", resetLayers);
  }

  const initAutoSlider = (containerSelector, slideSelector) => {
    const slider = document.querySelector(containerSelector);
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll(slideSelector));
    if (slides.length <= 1) return;

    let index = slides.findIndex((slide) => slide.classList.contains("active"));
    if (index === -1) index = 0;

    slides[index].classList.add("active");

    setInterval(() => {
      slides[index].classList.remove("active");
      index = (index + 1) % slides.length;
      slides[index].classList.add("active");
    }, 4000);
  };

  initAutoSlider(".mahuida-slider", ".slide");
  initAutoSlider(".eco-hero-slider", ".eco-hero-slide");

  const initWordReveal = () => {
    const wordRevealElements = document.querySelectorAll(".word-reveal");
    if (wordRevealElements.length === 0) return;

    wordRevealElements.forEach((el) => {
      const text = el.textContent.trim();
      const words = text.split(" ");
      el.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(" ");
    });

    const wordObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const words = entry.target.querySelectorAll(".word");
            words.forEach((word, i) => {
              word.style.transitionDelay = `${i * 0.08}s`;
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

  const initTypingAnimation = () => {
    const typingElements = document.querySelectorAll("[data-typing]");
    if (typingElements.length === 0) return;

    typingElements.forEach((el) => {
      const originalText = el.textContent.trim();
      const delay = parseInt(el.dataset.delay) || 0;
      el.textContent = "";
      el.style.visibility = "visible";

      const typeText = (element, text, index, callback) => {
        if (index < text.length) {
          element.textContent += text.charAt(index);
          setTimeout(() => typeText(element, text, index + 1, callback), 35);
        } else {
          if (callback) callback();
        }
      };

      const startTyping = () => {
        typeText(el, originalText, 0, () => {
          el.classList.add("typing-done");
        });
      };

      setTimeout(startTyping, delay);
    });
  };

  initTypingAnimation();
})();
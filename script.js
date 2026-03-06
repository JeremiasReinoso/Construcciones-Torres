(() => {
  const body = document.body;
  const loader = document.getElementById("loader");
  const logoSvg = loader ? loader.querySelector(".logo-svg") : null;
  const logoStrokes = loader ? loader.querySelectorAll(".logo-stroke path, .logo-stroke line, .logo-stroke polyline, .logo-stroke polygon, .logo-stroke rect, .logo-stroke circle, .logo-stroke ellipse") : [];
  const revealItems = document.querySelectorAll(".reveal");
  const counters = document.querySelectorAll(".stat-number");
  const parallaxContainer = document.querySelector("[data-parallax-container]");
  const depthLayers = document.querySelectorAll("[data-depth]");

  const hideLoader = () => {
    if (!loader) return;
    loader.classList.add("hide");
    body.classList.remove("is-loading");
  };

  const initLogoDraw = () => {
    if (!loader || !logoSvg) return;
    if (logoStrokes.length === 0) {
      window.setTimeout(hideLoader, 1200);
      return;
    }

    const baseDuration = 2400;
    const stagger = 80;
    logoStrokes.forEach((shape, index) => {
      if (typeof shape.getTotalLength !== "function") return;
      const length = Math.max(1, Math.ceil(shape.getTotalLength()));
      shape.style.strokeDasharray = `${length}`;
      shape.style.strokeDashoffset = `${length}`;
      shape.style.animationDelay = `${index * stagger}ms`;
      shape.style.animationDuration = `${baseDuration}ms`;
      shape.classList.add("draw");
    });

    const totalDrawTime = baseDuration + (logoStrokes.length - 1) * stagger;
    window.setTimeout(() => {
      logoSvg.classList.add("glow");
    }, totalDrawTime + 120);

    window.setTimeout(() => {
      hideLoader();
    }, totalDrawTime + 900);
  };

  window.addEventListener("load", initLogoDraw);

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
})();

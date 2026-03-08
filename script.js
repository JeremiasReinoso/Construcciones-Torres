(() => {
  const body = document.body;
  const intro = document.getElementById("intro-loader");
  const content = document.getElementById("main-content");
  const logoObject = intro ? intro.querySelector(".logo-container object") : null;
  const revealItems = document.querySelectorAll(".reveal");
  const counters = document.querySelectorAll(".stat-number");
  const parallaxContainer = document.querySelector("[data-parallax-container]");
  const depthLayers = document.querySelectorAll("[data-depth]");

  const hideIntro = () => {
    if (!intro || !content) return;
    intro.style.transition = "opacity 0.8s ease";
    intro.style.opacity = "0";

    setTimeout(() => {
      intro.style.display = "none";
      content.style.display = "block";
    }, 800);
  };

  const initLogoAnimation = () => {
    if (!logoObject) return;

    const onLogoLoad = () => {
      const svgDoc = logoObject.contentDocument;
      if (!svgDoc) return;

      const svgEl = svgDoc.querySelector("svg");
      const shapes = svgDoc.querySelectorAll("path, polygon, line, polyline, rect, circle, ellipse");
      if (!svgEl || shapes.length === 0) return;

      const style = svgDoc.createElement("style");
      style.textContent = `
        .intro-logo-path {
          fill: transparent;
          stroke: #ff6a00;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: var(--dash, 1000);
          stroke-dashoffset: var(--dash, 1000);
          animation: drawLogo 2.5s ease forwards;
        }
        .intro-logo-glow {
          filter: drop-shadow(0 0 10px #ff6a00) drop-shadow(0 0 20px #ff6a00);
        }
        @keyframes drawLogo {
          to { stroke-dashoffset: 0; }
        }
      `;
      svgEl.prepend(style);

      shapes.forEach((shape) => {
        if (typeof shape.getTotalLength === "function") {
          const len = Math.max(1, Math.ceil(shape.getTotalLength()));
          shape.style.setProperty("--dash", String(len));
        }
        shape.classList.add("intro-logo-path");
      });

      window.setTimeout(() => {
        svgEl.classList.add("intro-logo-glow");
      }, 2500);
    };

    logoObject.addEventListener("load", onLogoLoad, { once: true });
  };

  window.addEventListener("load", function () {
    if (!intro || !content) return;
    initLogoAnimation();

    setTimeout(() => {
      document.body.style.overflow = "auto";
      intro.style.opacity = "0";

      setTimeout(() => {
        intro.style.display = "none";
        content.style.opacity = "1";
      }, 800);
    }, 3000);
  });

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

(() => {
  const body = document.body;
  const loader = document.getElementById("loader");
  const logoObject = loader ? loader.querySelector(".logo-animation object") : null;
  let loaderHidden = false;
  const revealItems = document.querySelectorAll(".reveal");
  const counters = document.querySelectorAll(".stat-number");
  const parallaxContainer = document.querySelector("[data-parallax-container]");
  const depthLayers = document.querySelectorAll("[data-depth]");

  const hideLoader = () => {
    if (!loader || loaderHidden) return;
    loaderHidden = true;
    loader.classList.add("hide");
    body.classList.remove("is-loading");
    window.setTimeout(() => {
      if (loader) loader.style.display = "none";
    }, 650);
  };

  const initLogoDraw = () => {
    if (!loader || !logoObject) {
      window.setTimeout(hideLoader, 1500);
      return;
    }

    const onLogoReady = () => {
      const svgDoc = logoObject.contentDocument;
      if (!svgDoc) {
        window.setTimeout(hideLoader, 1500);
        return;
      }

      const svgEl = svgDoc.querySelector("svg");
      const shapes = svgDoc.querySelectorAll("path, line, polyline, polygon, rect, circle, ellipse");
      if (!svgEl || shapes.length === 0) {
        window.setTimeout(hideLoader, 1500);
        return;
      }

      const style = svgDoc.createElement("style");
      style.textContent = `
        .logo-path {
          fill: none;
          stroke: #ff6a00;
          stroke-width: 2.6;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: var(--dash, 1000);
          stroke-dashoffset: var(--dash, 1000);
          animation: drawLogo 2.5s ease forwards;
        }
        .neon-glow {
          filter: drop-shadow(0 0 10px #ff6a00) drop-shadow(0 0 20px #ff6a00);
        }
        @keyframes drawLogo {
          from { stroke-dashoffset: var(--dash, 1000); }
          to { stroke-dashoffset: 0; }
        }
      `;
      svgEl.prepend(style);

      shapes.forEach((shape) => {
        if (typeof shape.getTotalLength !== "function") {
          shape.classList.add("logo-path");
          shape.style.setProperty("--dash", "1000");
          return;
        }
        const length = Math.max(1, Math.ceil(shape.getTotalLength()));
        shape.classList.add("logo-path");
        shape.style.setProperty("--dash", String(length));
      });

      window.setTimeout(() => {
        svgEl.classList.add("neon-glow");
      }, 1400);

      window.setTimeout(() => {
        hideLoader();
      }, 1500);
    };

    logoObject.addEventListener("load", onLogoReady, { once: true });
  };

  // Always hide loader after load, even if the SVG never fires its load event.
  window.addEventListener("load", () => {
    initLogoDraw();
    window.setTimeout(hideLoader, 1500);
  });

  // Failsafe in case the load event is delayed by slow assets.
  window.setTimeout(hideLoader, 4500);

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

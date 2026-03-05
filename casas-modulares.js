(() => {
  const revealItems = document.querySelectorAll(".reveal");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const modelCards = document.querySelectorAll(".model-card");
  const projectLinks = document.querySelectorAll(".project-link");
  const planImage = document.querySelector(".plan-image");
  const zoomIn = document.querySelector("[data-zoom='in']");
  const zoomOut = document.querySelector("[data-zoom='out']");
  const zoomReset = document.querySelector("[data-zoom='reset']");
  let zoomLevel = 1;

  if (revealItems.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -32px 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const applyFilter = (value) => {
    modelCards.forEach((card) => {
      const area = Number(card.dataset.area || 0);
      const rooms = Number(card.dataset.rooms || 0);
      const matches =
        value === "all" ||
        (value === "1" && rooms === 1) ||
        (value === "2" && rooms === 2) ||
        (value === "3" && rooms === 3) ||
        (value === "80plus" && area >= 80);

      card.classList.toggle("hidden", !matches);
    });
  };

  if (filterButtons.length > 0 && modelCards.length > 0) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        applyFilter(button.dataset.filter || "all");
      });
    });
  }

  projectLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = link.getAttribute("href");
      if (!target) return;

      if (document.startViewTransition) return;

      event.preventDefault();
      document.body.classList.add("page-transitioning");
      window.setTimeout(() => {
        window.location.href = target;
      }, 260);
    });
  });

  const setZoom = (value) => {
    if (!planImage) return;
    zoomLevel = Math.min(2.6, Math.max(1, value));
    planImage.style.transform = `scale(${zoomLevel})`;
  };

  if (planImage) {
    zoomIn?.addEventListener("click", () => setZoom(zoomLevel + 0.2));
    zoomOut?.addEventListener("click", () => setZoom(zoomLevel - 0.2));
    zoomReset?.addEventListener("click", () => setZoom(1));
  }
})();

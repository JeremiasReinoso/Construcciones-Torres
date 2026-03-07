(() => {
  const revealItems = document.querySelectorAll(".reveal");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const modelCards = document.querySelectorAll(".model-card");
  const projectLinks = document.querySelectorAll(".project-link");
  const planImage = document.querySelector(".plan-image");
  const zoomIn = document.querySelector("[data-zoom='in']");
  const zoomOut = document.querySelector("[data-zoom='out']");
  const zoomReset = document.querySelector("[data-zoom='reset']");
  const houseViewer = document.getElementById("houseViewer");
  const selectorButtons = document.querySelectorAll(".model-selector button");
  const viewInteriorBtn = document.getElementById("viewInteriorBtn");
  const viewSpecsBtn = document.getElementById("viewSpecsBtn");
  const specsPanel = document.getElementById("viewerSpecs");
  const fallbackModels = document.querySelector(".viewer-fallback-models");
  const specModelName = document.getElementById("specModelName");
  const specArea = document.getElementById("specArea");
  const specRooms = document.getElementById("specRooms");
  const specBathrooms = document.getElementById("specBathrooms");
  const specDelivery = document.getElementById("specDelivery");
  let zoomLevel = 1;
  let activeModel = "compacta";
  let interiorMode = false;

  const viewerData = {
    compacta: {
      label: "Compacta",
      src: "models/casa-compacta.glb",
      area: "80m2",
      rooms: "2 habitaciones",
      bathrooms: "1 bano",
      delivery: "Entrega en 60 dias"
    },
    familiar: {
      label: "Familiar",
      src: "models/casa-familiar.glb",
      area: "120m2",
      rooms: "3 habitaciones",
      bathrooms: "2 banos",
      delivery: "Entrega en 75 dias"
    },
    premium: {
      label: "Premium",
      src: "models/casa-premium.glb",
      area: "180m2",
      rooms: "4 habitaciones",
      bathrooms: "3 banos",
      delivery: "Entrega en 90 dias"
    }
  };

  const fallbackMap = {
    compacta: fallbackModels?.dataset.compactaFallback || "",
    familiar: fallbackModels?.dataset.familiarFallback || "",
    premium: fallbackModels?.dataset.premiumFallback || ""
  };

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

  const updateViewerSpecs = (key) => {
    const config = viewerData[key];
    if (!config || !specModelName || !specArea || !specRooms || !specBathrooms || !specDelivery) return;

    specModelName.textContent = config.label;
    specArea.textContent = config.area;
    specRooms.textContent = config.rooms;
    specBathrooms.textContent = config.bathrooms;
    specDelivery.textContent = config.delivery;
  };

  const setActiveSelector = (key) => {
    selectorButtons.forEach((button) => {
      const isActive = button.dataset.model === key;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  };

  const setViewerSource = (key) => {
    if (!houseViewer || !viewerData[key]) return;

    houseViewer.classList.add("is-switching");
    updateViewerSpecs(key);
    setActiveSelector(key);
    activeModel = key;
    interiorMode = false;
    if (viewInteriorBtn) viewInteriorBtn.textContent = "Ver interior";

    window.setTimeout(() => {
      houseViewer.src = viewerData[key].src;
    }, 170);
  };

  if (houseViewer && selectorButtons.length > 0) {
    selectorButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const modelKey = button.dataset.model;
        if (!modelKey || modelKey === activeModel) return;
        setViewerSource(modelKey);
      });
    });

    houseViewer.addEventListener("load", () => {
      houseViewer.classList.remove("is-switching");
    });

    houseViewer.addEventListener("error", () => {
      const fallback = fallbackMap[activeModel];
      if (!fallback || houseViewer.src === fallback) {
        houseViewer.classList.remove("is-switching");
        return;
      }
      houseViewer.src = fallback;
    });

    updateViewerSpecs(activeModel);
    setActiveSelector(activeModel);
  }

  if (viewSpecsBtn && specsPanel) {
    viewSpecsBtn.addEventListener("click", () => {
      specsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (viewInteriorBtn && houseViewer) {
    viewInteriorBtn.addEventListener("click", () => {
      interiorMode = !interiorMode;

      if (interiorMode) {
        houseViewer.setAttribute("camera-orbit", "0deg 83deg 2.2m");
        houseViewer.removeAttribute("auto-rotate");
        viewInteriorBtn.textContent = "Ver exterior";
      } else {
        houseViewer.removeAttribute("camera-orbit");
        houseViewer.setAttribute("auto-rotate", "");
        viewInteriorBtn.textContent = "Ver interior";
      }
    });
  }
})();

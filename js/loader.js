window.addEventListener("load", function () {
  const loader = document.getElementById("page-loader");
  const content = document.getElementById("main-content");
  if (!loader) return;

  loader.style.opacity = "0";

  setTimeout(() => {
    loader.style.display = "none";
    if (content) {
      content.style.opacity = "1";
    }
    document.body.classList.remove("is-loading");
    document.body.style.overflow = "auto";
  }, 600);
});

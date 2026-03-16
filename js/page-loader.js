window.addEventListener("load", function () {
  const loader = document.getElementById("page-loader");
  if (!loader) return;

  loader.style.opacity = "0";

  setTimeout(() => {
    loader.remove();
  }, 600);
});

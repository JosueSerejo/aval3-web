
// MENU TOGGLE
document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");

    menuToggle.addEventListener("click", () => {
        mainNav.classList.toggle("menu-open");
        menuToggle.classList.toggle("open");
    });
});
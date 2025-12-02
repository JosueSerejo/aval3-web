document.addEventListener('DOMContentLoaded', () => {
    const menuToggleLabel = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");

    if (menuToggleLabel && mainNav) {
        menuToggleLabel.addEventListener("click", () => {
            menuToggleLabel.classList.toggle("open");
            
            mainNav.classList.toggle("menu-open");
        });
    }
});
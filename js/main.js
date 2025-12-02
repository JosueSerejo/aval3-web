import { CountryExplorerApp } from './modules/AppLogic.js'; 

document.addEventListener("DOMContentLoaded", () => {
    window.app = new CountryExplorerApp();
    app.init();
});
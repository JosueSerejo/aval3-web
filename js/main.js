import { CountryExplorerApp } from './AppLogic.js';

document.addEventListener("DOMContentLoaded", () => {
    window.app = new CountryExplorerApp();
    app.init();
});
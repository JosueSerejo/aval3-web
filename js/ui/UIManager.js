import { UIRenderer } from './UiRenderer.js'; 
import { ModalRenderer } from './ModalRenderer.js'; 

export class UIManager {
    constructor(app) {
        this.app = app;
        this.MIN_LOADING_TIME = 800;
        
        this.uiRenderer = new UIRenderer(app);
        this.modalRenderer = new ModalRenderer();

        this.COUNTRIES_PER_PAGE = this.uiRenderer.COUNTRIES_PER_PAGE;
        this.currentPage = this.uiRenderer.currentPage;
    }

    showLoading(containerId = "loading") {
        const el = document.getElementById(containerId);
        if (el) el.classList.remove("hidden");
        if (containerId === "loading") {
            const countriesListEl = document.getElementById("countriesList");
            if (countriesListEl) countriesListEl.innerHTML = "";
            const paginationContainer = document.getElementById("pagination");
            if (paginationContainer) paginationContainer.innerHTML = "";
        }
    }

    hideLoading(containerId = "loading") {
        const el = document.getElementById(containerId);
        if (el) el.classList.add("hidden");
    }

    async displayCountriesPage(list, page = 1) {
        if (!list || list.length === 0) {
            this.uiRenderer.renderCountries([]);
            return;
        }

        this.showLoading();
        this.uiRenderer.currentPage = page;

        const delayPromise = new Promise(resolve => setTimeout(resolve, this.MIN_LOADING_TIME));

        const startIndex = (page - 1) * this.COUNTRIES_PER_PAGE;
        const endIndex = startIndex + this.COUNTRIES_PER_PAGE;

        const countriesToRender = list.slice(startIndex, endIndex);

        await delayPromise;

        this.uiRenderer.renderCountries(countriesToRender);
        this.uiRenderer.renderPaginationControls(list);
        this.hideLoading();
    }
    
    renderModalDetails(country) {
        this.modalRenderer.renderModalDetails(country);
    }
}
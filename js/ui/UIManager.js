import { UIRenderer } from './UIRenderer.js';
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

    showToast(message, type = 'error', duration = 4000) {
        const container = document.getElementById("appMessages");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        
        const title = type === 'error' ? "Erro:" : (type === 'warning' ? "Atenção:" : "Informação:");
        toast.innerHTML = `<strong>${title}</strong> ${message}`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10); 

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                container.removeChild(toast);
            }, 500);
        }, duration);
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

    showSearchClearButton(inputElement) {
        const clearBtn = document.getElementById("clearSearchBtn");
        
        if (clearBtn) {
            clearBtn.classList.remove("hidden");
            
            clearBtn.onclick = async () => {
                inputElement.value = '';
                this.hideSearchClearButton();
                this.app.deactivateFavoritesFilter(); 
                await this.app.fetchAllCountries();
            };
        }
    }

    hideSearchClearButton() {
        const clearBtn = document.getElementById("clearSearchBtn");
        if (clearBtn) {
            clearBtn.classList.add("hidden");
            clearBtn.onclick = null;
        }
    }
}
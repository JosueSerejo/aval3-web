const essentialFields = 'name,flags,capital,region,population,cca3';
const COUNTRIES_PER_PAGE = 8;
let globalCountriesList = [];
let currentPage = 1;

const MIN_LOADING_TIME = 800;

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");
    const countryModal = document.getElementById("countryModal");
    const closeBtn = countryModal.querySelector(".close-btn");

    menuToggle.addEventListener("click", () => {
        mainNav.classList.toggle("menu-open");
        menuToggle.classList.toggle("open");
    });

    document.getElementById("searchBtn").addEventListener("click", () => {
        const name = document.getElementById("searchInput").value.trim();

        if (name === "") {
            fetchAllCountries();
        } else {
            searchCountry(name);
        }
    });

    document.getElementById("searchInput").addEventListener("keypress", e => {
        if (e.key === "Enter") {
            document.getElementById("searchBtn").click();
        }
    });

    document.getElementById("continentFilter").addEventListener("change", e => {
        filterByContinent(e.target.value);
    });

    closeBtn.addEventListener("click", () => {
        countryModal.classList.add("hidden");
    });

    countryModal.addEventListener("click", (e) => {
        if (e.target === countryModal) {
            countryModal.classList.add("hidden");
        }
    });

    fetchAllCountries();
});

function showLoading(containerId = "loading") {
    document.getElementById(containerId).classList.remove("hidden");
    if (containerId === "loading") {
        document.getElementById("countriesList").innerHTML = "";
        const paginationContainer = document.getElementById("pagination");
        if (paginationContainer) {
            paginationContainer.innerHTML = "";
        }
    } else if (containerId === "modalLoading") {
        document.getElementById("modalDetails").classList.add("hidden");
    }
}

function hideLoading(containerId = "loading") {
    document.getElementById(containerId).classList.add("hidden");
    if (containerId === "modalLoading") {
        document.getElementById("modalDetails").classList.remove("hidden");
    }
}

async function delayAndHideLoading(containerId = "loading") {
    const startTime = Date.now();
    const elapsedTime = Date.now() - startTime;
    const remainingTime = MIN_LOADING_TIME - elapsedTime;

    if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
    hideLoading(containerId);
}

async function fetchAllCountries() {
    showLoading();

    const fetchPromise = fetch(`https://restcountries.com/v3.1/all?fields=${essentialFields}`);
    const delayPromise = new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME));

    try {
        const [response] = await Promise.all([fetchPromise, delayPromise]);

        if (!response.ok) {
            throw new Error(`Não foi possível carregar todos os países. Status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            globalCountriesList = data;
            displayCountriesPage(1, false);
        } else {
            throw new Error("A API retornou um formato inesperado ou lista vazia.");
        }

    } catch (error) {
        await delayAndHideLoading();
        alert("Erro ao carregar países: " + error.message);
        document.getElementById("countriesList").innerHTML = "<p>Não foi possível carregar os dados dos países.</p>";
    } finally {
        hideLoading();
    }
}

async function searchCountry(name) {
    showLoading();

    const fetchPromise = fetch(`https://restcountries.com/v3.1/name/${name}?fields=${essentialFields}`);
    const delayPromise = new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME));

    try {
        const [response] = await Promise.all([fetchPromise, delayPromise]);

        if (!response.ok) {
            if (response.status === 404) {
                await delayAndHideLoading();
                document.getElementById("countriesList").innerHTML = `
                    <p class="not-found-message">Nenhum país encontrado com o nome: <strong>${name}</strong>.</p>
                `;
                const paginationContainer = document.getElementById("pagination");
                if (paginationContainer) paginationContainer.innerHTML = "";
                return;
            }
            throw new Error(`Erro na busca. Status: ${response.status}`);
        }

        const data = await response.json();
        globalCountriesList = data;
        displayCountriesPage(1, false);

    } catch (error) {
        await delayAndHideLoading();
        alert("Erro: " + error.message);
    } finally {
        hideLoading();
    }
}

async function filterByContinent(continent) {
    showLoading();

    if (continent === "") {
        fetchAllCountries();
        return;
    }

    const fetchPromise = fetch(
        `https://restcountries.com/v3.1/region/${continent}?fields=${essentialFields}`
    );
    const delayPromise = new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME));

    try {
        const [response] = await Promise.all([fetchPromise, delayPromise]);

        if (!response.ok) {
            throw new Error("Erro ao filtrar continente");
        }

        const data = await response.json();
        globalCountriesList = data;
        displayCountriesPage(1, false);

    } catch (error) {
        await delayAndHideLoading();
        alert("Erro: " + error.message);
    } finally {
        hideLoading();
    }
}

async function displayCountriesPage(page, applyDelay = true) {
    if (!globalCountriesList || globalCountriesList.length === 0) {
        renderCountries([]);
        return;
    }

    if (applyDelay) {
        showLoading();
        await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME));
    }

    currentPage = page;
    const startIndex = (currentPage - 1) * COUNTRIES_PER_PAGE;
    const endIndex = startIndex + COUNTRIES_PER_PAGE;

    const countriesToRender = globalCountriesList.slice(startIndex, endIndex);

    renderCountries(countriesToRender);
    renderPaginationControls();
    hideLoading();
}

function renderCountries(list) {
    const container = document.getElementById("countriesList");
    container.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
        container.innerHTML = "<p>Nenhum país encontrado para o filtro selecionado.</p>";
        const paginationContainer = document.getElementById("pagination");
        if (paginationContainer) paginationContainer.innerHTML = "";
        return;
    }

    list.forEach(country => {
        const flagSrc = country.flags.svg || country.flags.png;

        const card = `
            <div class="country-card" data-country-code="${country.cca3}">
                <img src="${flagSrc}" alt="Bandeira de ${country.name.common}">
                <h3>${country.name.common}</h3>
                <p><strong>Capital:</strong> ${country.capital?.[0] || "N/A"}</p>
                <p><strong>Região:</strong> ${country.region || "N/A"}</p>
                <p><strong>População:</strong> ${country.population?.toLocaleString() || "N/A"}</p>
            </div>
        `;
        container.innerHTML += card;
    });

    document.querySelectorAll(".country-card").forEach(card => {
        card.addEventListener("click", (e) => {
            const countryCode = e.currentTarget.getAttribute("data-country-code");
            if (countryCode) {
                showCountryDetails(countryCode);
            }
        });
    });
}

function renderPaginationControls() {
    const totalCountries = globalCountriesList.length;
    const totalPages = Math.ceil(totalCountries / COUNTRIES_PER_PAGE);
    const paginationContainer = document.getElementById("pagination");

    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }

    let buttonsHTML = '';

    buttonsHTML += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="displayCountriesPage(${currentPage - 1}, true)">Anterior</button>`;

    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
        start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
        buttonsHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="displayCountriesPage(${i}, true)">
                ${i}
            </button>
        `;
    }

    buttonsHTML += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="displayCountriesPage(${currentPage + 1}, true)">Próxima</button>`;

    paginationContainer.innerHTML = buttonsHTML;
}

async function showCountryDetails(code) {
    const modal = document.getElementById("countryModal");
    modal.classList.remove("hidden");
    showLoading("modalLoading");

    const detailedFields = 'name,flags,capital,region,population,area,languages,currencies,tld,borders,latlng';

    const fetchPromise = fetch(
        `https://restcountries.com/v3.1/alpha/${code}?fields=${detailedFields}`
    );
    const delayPromise = new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME));

    try {
        const [response] = await Promise.all([fetchPromise, delayPromise]);

        if (!response.ok) {
            throw new Error(`Não foi possível carregar os detalhes do país. Status: ${response.status}`);
        }

        const data = await response.json();
        renderModalDetails(data);

    } catch (error) {
        alert("Erro ao carregar detalhes: " + error.message);
        modal.classList.add("hidden");
    } finally {
        hideLoading("modalLoading");
    }
}

function renderModalDetails(country) {
    const formatValue = (value, unit = "") => value !== undefined ? `${value.toLocaleString()} ${unit}`.trim() : "N/A";

    document.getElementById("modalName").textContent = country.name.common;
    document.getElementById("modalFlag").src = country.flags.svg || country.flags.png;
    document.getElementById("modalFlag").alt = `Bandeira de ${country.name.common}`;
    document.getElementById("modalOfficialName").textContent = formatValue(country.name.official);
    document.getElementById("modalArea").textContent = formatValue(country.area, "km²");
    document.getElementById("modalPopulation").textContent = formatValue(country.population);
    document.getElementById("modalCapital").textContent = country.capital?.[0] || "N/A";
    document.getElementById("modalRegion").textContent = country.region || "N/A";

    let languages = "N/A";
    if (country.languages) {
        languages = Object.values(country.languages).join(", ");
    }
    document.getElementById("modalLanguages").textContent = languages;

    let currencies = "N/A";
    if (country.currencies) {
        currencies = Object.values(country.currencies)
            .map(c => `${c.name} (${c.symbol || 'Símbolo N/A'})`)
            .join(", ");
    }
    document.getElementById("modalCurrencies").textContent = currencies;

    document.getElementById("modalTld").textContent = country.tld?.[0] || "N/A";

    const bordersContainer = document.getElementById("modalBordersContainer");
    const bordersElement = document.getElementById("modalBorders");
    if (country.borders && country.borders.length > 0) {
        bordersContainer.classList.remove("hidden");
        bordersElement.textContent = country.borders.join(", ");
    } else {
        bordersContainer.classList.add("hidden");
    }

    const mapContainer = document.getElementById("modalMapEmbed");
    mapContainer.innerHTML = "";

    const lat = country.latlng?.[0];
    const lon = country.latlng?.[1];

    if (lat !== undefined && lon !== undefined) {
        const mapUrl = `https://maps.google.com/maps?q=${lat},${lon}&hl=pt&z=6&output=embed`;
        const iframe = document.createElement("iframe");
        iframe.src = mapUrl;
        iframe.setAttribute("loading", "lazy");
        iframe.setAttribute("allowfullscreen", "");
        mapContainer.appendChild(iframe);
    } else {
        mapContainer.innerHTML = "<p>Coordenadas do mapa não disponíveis.</p>";
    }
}
export class ModalRenderer {
    renderModalDetails(country) {
        const formatValue = (value, unit = "") => {
            if (value === undefined || value === null) return "N/A";
            if (typeof value === "number") return `${value.toLocaleString()} ${unit}`.trim();
            return `${value} ${unit}`.trim();
        };

        document.getElementById("modalName").textContent = country.name.common;
        document.getElementById("modalFlag").src = country.flags.svg || country.flags.png;
        document.getElementById("modalFlag").alt = `Bandeira de ${country.name.common}`;
        document.getElementById("modalOfficialName").textContent = formatValue(country.name.official);
        document.getElementById("modalArea").textContent = formatValue(country.area, "km²");
        document.getElementById("modalPopulation").textContent = formatValue(country.population);
        document.getElementById("modalCapital").textContent = country.capital?.[0] || "N/A";
        document.getElementById("modalRegion").textContent = country.region || "N/A";

        const languages = country.languages ? Object.values(country.languages).join(", ") : "N/A";
        document.getElementById("modalLanguages").textContent = languages;

        const currencies = country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol || 'N/A'})`).join(", ") : "N/A";
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
}
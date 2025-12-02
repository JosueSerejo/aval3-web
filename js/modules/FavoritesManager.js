export class FavoritesManager {
    constructor() {
        this.favoriteCountries = JSON.parse(localStorage.getItem("favorites")) || [];
    }

    toggleFavorite(code) {
        if (!code) return;
        if (this.favoriteCountries.includes(code)) {
            this.favoriteCountries = this.favoriteCountries.filter(c => c !== code);
        } else {
            this.favoriteCountries.push(code);
        }
        this._save();
    }

    isFavorite(code) {
        return this.favoriteCountries.includes(code);
    }

    filterFavorites(list) {
        return list.filter(c => this.favoriteCountries.includes(c.cca3));
    }

    _save() {
        localStorage.setItem("favorites", JSON.stringify(this.favoriteCountries));
    }
}
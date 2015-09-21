export default class SniperPortfolio {
    constructor() {
        this.snipers = [];
        this.listeners = [];
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    addSniper(sniper) {
        this.snipers.push(sniper);
        this.listeners.forEach(listener => listener.sniperAdded(sniper));
    }
}

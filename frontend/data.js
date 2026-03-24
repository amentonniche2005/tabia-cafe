// ========== CONFIGURATION API ==========
// Détecte automatiquement l'URL du serveur
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : window.location.origin + '/api';

console.log('🌐 API URL:', API_URL);

// ========== PRODUITS ==========
const produits = [
    { id: 1, nom: "Espresso", prix: 2.5, categorie: "cafe", description: "Café italien intense", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400" },
    { id: 2, nom: "Cappuccino", prix: 3.8, categorie: "cafe", description: "Café onctueux", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400" },
    { id: 3, nom: "Latte Macchiato", prix: 4.2, categorie: "cafe", description: "Lait chaud et café", image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400" },
    { id: 4, nom: "Americano", prix: 2.2, categorie: "cafe", description: "Café américain", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400" },
    { id: 5, nom: "Jus d'orange", prix: 4.5, categorie: "boissons", description: "Jus frais pressé", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400" },
    { id: 6, nom: "Croissant", prix: 2.5, categorie: "pd", description: "Croissant pur beurre", image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400" },
    { id: 7, nom: "Hamburger", prix: 8.5, categorie: "sandwish", description: "Steak haché", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
    { id: 8, nom: "Pasta Carbonara", prix: 12.9, categorie: "plat", description: "Pâtes à la crème", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400" }
];

// ========== FONCTIONS API ==========
let commandesCache = [];
let socket = null;
let listeners = [];

function initSocket() {
    const socketUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : window.location.origin;
    
    socket = io(socketUrl);
    
    socket.on('connect', () => {
        console.log('🔌 Connecté au serveur');
    });
    
    socket.on('commandes_initiales', (commandes) => {
        commandesCache = commandes;
        notifyListeners();
    });
    
    socket.on('nouvelle_commande', (commande) => {
        commandesCache.push(commande);
        notifyListeners();
    });
    
    socket.on('mise_a_jour_commande', (commande) => {
        const index = commandesCache.findIndex(c => c.id === commande.id);
        if (index !== -1) {
            commandesCache[index] = commande;
            notifyListeners();
        }
    });
    
    socket.on('suppression_commande', (id) => {
        commandesCache = commandesCache.filter(c => c.id != id);
        notifyListeners();
    });
}

function getToutesCommandes() {
    return commandesCache;
}

function getCommandesClient(clientId) {
    return commandesCache.filter(c => c.clientId === clientId);
}

async function ajouterCommande(panier, type = "client", numeroTable = null) {
    const clientId = localStorage.getItem('clientId');
    
    const response = await fetch(`${API_URL}/commandes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            articles: panier,
            numeroTable: numeroTable,
            clientId: clientId
        })
    });
    
    if (!response.ok) {
        throw new Error('Erreur lors de la création de la commande');
    }
    
    return await response.json();
}

async function changerStatutCommande(commandeId, nouveauStatut) {
    const response = await fetch(`${API_URL}/commandes/${commandeId}/statut`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: nouveauStatut })
    });
    
    if (!response.ok) {
        throw new Error('Erreur lors du changement de statut');
    }
    
    return await response.json();
}

async function supprimerCommande(commandeId) {
    const response = await fetch(`${API_URL}/commandes/${commandeId}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
    }
    
    return await response.json();
}

async function payerCommande(commandeId) {
    const response = await fetch(`${API_URL}/commandes/${commandeId}/payer`, {
        method: 'PUT'
    });
    
    if (!response.ok) {
        throw new Error('Erreur lors du paiement');
    }
    
    return await response.json();
}

async function getStats() {
    const response = await fetch(`${API_URL}/stats`);
    return await response.json();
}

function ecouterMisesAJour(callback) {
    listeners.push(callback);
}

function notifyListeners() {
    listeners.forEach(callback => callback());
}

// Initialisation
initSocket();

console.log("✅ data.js chargé (version serveur)");
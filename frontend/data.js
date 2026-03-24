// ========== CONFIGURATION API ==========
// Détecte automatiquement l'URL du serveur
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : window.location.origin + '/api';

console.log('🌐 API URL:', API_URL);

// ========== PRODUITS ==========
const produits = [
    // ========== CAFÉS ==========
    { 
        id: 1, 
        nom: "Espresso", 
        prix: 2.5, 
        categorie: "cafe", 
        description: "Café italien intense et corsé - 100% Arabica", 
        image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop"
    },
    { 
        id: 2, 
        nom: "Cappuccino", 
        prix: 3.8, 
        categorie: "cafe", 
        description: "Café onctueux avec mousse de lait et cacao", 
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop"
    },
    { 
        id: 3, 
        nom: "Latte Macchiato", 
        prix: 4.2, 
        categorie: "cafe", 
        description: "Lait chaud, café expresso et mousse de lait", 
        image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=300&fit=crop"
    },
    { 
        id: 4, 
        nom: "Americano", 
        prix: 2.2, 
        categorie: "cafe", 
        description: "Café américain léger et aromatique", 
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop"
    },
    { 
        id: 5, 
        nom: "Mocha", 
        prix: 4.5, 
        categorie: "cafe", 
        description: "Café au chocolat avec crème fouettée", 
        image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&h=300&fit=crop"
    },
    { 
        id: 6, 
        nom: "Caramel Macchiato", 
        prix: 4.8, 
        categorie: "cafe", 
        description: "Café à la vanille avec caramel", 
        image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=300&fit=crop"
    },

    // ========== BOISSONS FRAÎCHES ==========
    { 
        id: 7, 
        nom: "Jus d'orange", 
        prix: 4.5, 
        categorie: "boissons", 
        description: "Jus d'orange frais pressé - 100% pur fruit", 
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop"
    },
    { 
        id: 8, 
        nom: "Citronnade", 
        prix: 3.5, 
        categorie: "boissons", 
        description: "Citron pressé maison, menthe fraîche", 
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop"
    },
    { 
        id: 9, 
        nom: "Smoothie Fruits Rouges", 
        prix: 5.5, 
        categorie: "boissons", 
        description: "Fraise, framboise, myrtille - Lait végétal", 
        image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop"
    },
    { 
        id: 10, 
        nom: "Smoothie Mangue", 
        prix: 5.5, 
        categorie: "boissons", 
        description: "Mangue, banane, lait de coco", 
        image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop"
    },
    { 
        id: 11, 
        nom: "Ice Tea Pêche", 
        prix: 3.5, 
        categorie: "boissons", 
        description: "Thé glacé à la pêche - Maison", 
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop"
    },
    { 
        id: 12, 
        nom: "Milkshake Chocolat", 
        prix: 5.0, 
        categorie: "boissons", 
        description: "Lait frappé au chocolat, chantilly", 
        image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&h=300&fit=crop"
    },

    // ========== SANDWICHS ==========
    { 
        id: 13, 
        nom: "Hamburger", 
        prix: 8.5, 
        categorie: "sandwish", 
        description: "Steak haché 180g, salade, tomate, oignon, sauce maison", 
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop"
    },
    { 
        id: 14, 
        nom: "Sandwich Mixte", 
        prix: 6.5, 
        categorie: "sandwish", 
        description: "Jambon, fromage, laitue, mayonnaise", 
        image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=300&fit=crop"
    },
    { 
        id: 15, 
        nom: "Sandwich Thon", 
        prix: 6.0, 
        categorie: "sandwish", 
        description: "Thon, œuf, laitue, tomate", 
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop"
    },
    { 
        id: 16, 
        nom: "Panini Poulet", 
        prix: 7.5, 
        categorie: "sandwish", 
        description: "Poulet grillé, mozzarella, pesto", 
        image: "https://images.unsplash.com/photo-1623334044303-241021148842?w=400&h=300&fit=crop"
    },
    { 
        id: 17, 
        nom: "Wrap Caesar", 
        prix: 7.8, 
        categorie: "sandwish", 
        description: "Poulet, salade, parmesan, sauce Caesar", 
        image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop"
    },
    { 
        id: 18, 
        nom: "Club Sandwich", 
        prix: 8.0, 
        categorie: "sandwish", 
        description: "Pain de mie, poulet, bacon, salade, tomate", 
        image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop"
    },

    // ========== PETIT DÉJEUNER ==========
    { 
        id: 19, 
        nom: "Croissant", 
        prix: 2.5, 
        categorie: "pd", 
        description: "Croissant feuilleté pur beurre - Fait maison", 
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=300&fit=crop"
    },
    { 
        id: 20, 
        nom: "Pain au Chocolat", 
        prix: 2.8, 
        categorie: "pd", 
        description: "Viennoiserie au chocolat - Pur beurre", 
        image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop"
    },
    { 
        id: 21, 
        nom: "Pain aux Raisins", 
        prix: 2.8, 
        categorie: "pd", 
        description: "Viennoiserie aux raisins et crème pâtissière", 
        image: "https://images.unsplash.com/photo-1623334044303-241021148842?w=400&h=300&fit=crop"
    },
    { 
        id: 22, 
        nom: "Brioche", 
        prix: 3.0, 
        categorie: "pd", 
        description: "Brioche feuilletée - Spécialité maison", 
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop"
    },
    { 
        id: 23, 
        nom: "Fondant au Chocolat", 
        prix: 6.0, 
        categorie: "pd", 
        description: "Cœur coulant au chocolat noir - Maison", 
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop"
    },
    { 
        id: 24, 
        nom: "Tiramisu", 
        prix: 5.5, 
        categorie: "pd", 
        description: "Dessert italien au café et mascarpone", 
        image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop"
    },

    // ========== PLATS CHAUDS ==========
    { 
        id: 25, 
        nom: "Pasta Carbonara", 
        prix: 12.9, 
        categorie: "plat", 
        description: "Pâtes fraîches, crème, lardons, parmesan", 
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop"
    },
    { 
        id: 26, 
        nom: "Pasta Bolognaise", 
        prix: 12.9, 
        categorie: "plat", 
        description: "Pâtes, sauce bolognaise maison, parmesan", 
        image: "https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=400&h=300&fit=crop"
    },
    { 
        id: 27, 
        nom: "Ejja Merguez", 
        prix: 10.5, 
        categorie: "plat", 
        description: "Œufs, merguez, pommes de terre sautées", 
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop"
    },
    { 
        id: 28, 
        nom: "Escalope Panée", 
        prix: 11.9, 
        categorie: "plat", 
        description: "Escalope de poulet panée, frites maison", 
        image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop"
    },
    { 
        id: 29, 
        nom: "Mechwi", 
        prix: 13.5, 
        categorie: "plat", 
        description: "Viande grillée, salade, frites, sauce", 
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop"
    },
    { 
        id: 30, 
        nom: "Salade César", 
        prix: 9.9, 
        categorie: "plat", 
        description: "Poulet grillé, salade, parmesan, croûtons", 
        image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop"
    }
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
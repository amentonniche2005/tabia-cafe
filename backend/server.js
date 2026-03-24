const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes principales
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/comptoir.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/comptoir.html'));
});

app.get('/caisse.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/caisse.html'));
});

// ========== STOCKAGE ==========
let commandes = [];

// Produits par défaut
let produits = [
    { id: 1, nom: "Espresso", prix: 2.5, categorie: "cafe", description: "Café italien intense", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400" },
    { id: 2, nom: "Cappuccino", prix: 3.8, categorie: "cafe", description: "Café onctueux", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400" },
    { id: 3, nom: "Latte Macchiato", prix: 4.2, categorie: "cafe", description: "Lait chaud et café", image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400" },
    { id: 4, nom: "Americano", prix: 2.2, categorie: "cafe", description: "Café américain", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400" },
    { id: 5, nom: "Jus d'orange", prix: 4.5, categorie: "boissons", description: "Jus frais pressé", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400" },
    { id: 6, nom: "Croissant", prix: 2.5, categorie: "pd", description: "Croissant pur beurre", image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400" },
    { id: 7, nom: "Hamburger", prix: 8.5, categorie: "sandwish", description: "Steak haché", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
    { id: 8, nom: "Pasta Carbonara", prix: 12.9, categorie: "plat", description: "Pâtes à la crème", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400" }
];

// ========== ROUTES API ==========

// Produits
app.get('/api/produits', (req, res) => {
    res.json(produits);
});

// Toutes les commandes
app.get('/api/commandes', (req, res) => {
    res.json(commandes);
});

// Commandes d'un client
app.get('/api/commandes/client/:clientId', (req, res) => {
    const clientId = req.params.clientId;
    const mesCommandes = commandes.filter(c => c.clientId === clientId);
    res.json(mesCommandes);
});

// Créer une commande
app.post('/api/commandes', (req, res) => {
    const { articles, numeroTable, clientId } = req.body;
    
    if (!articles || articles.length === 0) {
        return res.status(400).json({ error: 'Panier vide' });
    }
    
    let total = 0;
    articles.forEach(a => total += a.prix * a.quantite);
    
    const nouvelleCommande = {
        id: Date.now(),
        numero: commandes.length + 1,
        articles: articles,
        total: total,
        numeroTable: numeroTable,
        clientId: clientId,
        statut: 'en_attente',
        date: new Date().toLocaleString('fr-FR'),
        dateTimestamp: Date.now()
    };
    
    commandes.push(nouvelleCommande);
    io.emit('nouvelle_commande', nouvelleCommande);
    
    console.log(`📦 Nouvelle commande #${nouvelleCommande.numero} - Table ${numeroTable}`);
    
    res.status(201).json(nouvelleCommande);
});

// Changer statut
app.put('/api/commandes/:id/statut', (req, res) => {
    const { statut } = req.body;
    const index = commandes.findIndex(c => c.id == req.params.id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    commandes[index].statut = statut;
    io.emit('mise_a_jour_commande', commandes[index]);
    
    console.log(`🔄 Commande #${commandes[index].numero} : ${statut}`);
    
    res.json(commandes[index]);
});

// Marquer comme payé
app.put('/api/commandes/:id/payer', (req, res) => {
    const index = commandes.findIndex(c => c.id == req.params.id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    commandes[index].statut = 'paye';
    io.emit('mise_a_jour_commande', commandes[index]);
    
    console.log(`💰 Commande #${commandes[index].numero} payée`);
    
    res.json(commandes[index]);
});

// Supprimer commande
app.delete('/api/commandes/:id', (req, res) => {
    const index = commandes.findIndex(c => c.id == req.params.id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    commandes.splice(index, 1);
    io.emit('suppression_commande', req.params.id);
    
    res.json({ message: 'Commande supprimée' });
});

// Statistiques
app.get('/api/stats', (req, res) => {
    const enAttente = commandes.filter(c => c.statut === 'en_attente').length;
    const enPreparation = commandes.filter(c => c.statut === 'en_preparation').length;
    const terminees = commandes.filter(c => c.statut === 'terminee').length;
    const paye = commandes.filter(c => c.statut === 'paye').length;
    const totalVentes = commandes.filter(c => c.statut === 'paye').reduce((sum, c) => sum + c.total, 0);
    
    res.json({ enAttente, enPreparation, terminees, paye, totalVentes });
});

// ========== WEBSOCKET ==========
io.on('connection', (socket) => {
    console.log('🟢 Client connecté');
    socket.emit('commandes_initiales', commandes);
    
    socket.on('disconnect', () => {
        console.log('🔴 Client déconnecté');
    });
});

// ========== DÉMARRAGE ==========
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Serveur TA'BIA démarré sur le port ${PORT}`);
});
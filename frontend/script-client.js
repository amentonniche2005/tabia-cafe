// ========== VARIABLES ==========
let panier = [];
let categorieActuelle = "all";
let clientId = null;

// ========== CHARGEMENT ==========
document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Page client chargée");
    
    // Générer un ID client unique
    clientId = localStorage.getItem('clientId');
    if (!clientId) {
        clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('clientId', clientId);
    }
    
    chargerPanier();
    afficherProduits();
    mettreAJourCompteurPanier();
    chargerMesCommandes();
    
    // Écouter les mises à jour
    ecouterMisesAJour(function() {
        console.log("📢 Mise à jour reçue");
        chargerMesCommandes();
    });
    
    configurerEvenements();
});

// ========== AFFICHER PRODUITS ==========
function afficherProduits() {
    const grille = document.getElementById("menuGrid");
    if (!grille) return;
    
    let produitsAffiches = produits;
    if (categorieActuelle !== "all") {
        produitsAffiches = produits.filter(p => p.categorie === categorieActuelle);
    }
    
    if (produitsAffiches.length === 0) {
        grille.innerHTML = "<p>Aucun produit</p>";
        return;
    }
    
    let html = "";
    for (let p of produitsAffiches) {
        html += `
            <div class="menu-item">
                <img src="${p.image}" class="item-image" onerror="this.src='https://via.placeholder.com/400x200?text=${p.nom}'">
                <div class="item-info">
                    <h3>${p.nom}</h3>
                    <p>${p.description}</p>
                    <div class="price">${p.prix} €</div>
                    <button class="add-to-cart" onclick="ajouterAuPanier(${p.id})">
                        🛒 Ajouter
                    </button>
                </div>
            </div>
        `;
    }
    grille.innerHTML = html;
}

// ========== PANIER ==========
function ajouterAuPanier(id) {
    let produit = produits.find(p => p.id === id);
    if (!produit) return;
    
    let existe = panier.find(item => item.id === id);
    if (existe) {
        existe.quantite++;
    } else {
        panier.push({
            id: produit.id,
            nom: produit.nom,
            prix: produit.prix,
            quantite: 1
        });
    }
    
    sauvegarderPanier();
    mettreAJourCompteurPanier();
    afficherNotification(produit.nom + " ajouté !");
}

function sauvegarderPanier() {
    localStorage.setItem("mon_panier", JSON.stringify(panier));
}

function chargerPanier() {
    const panierString = localStorage.getItem("mon_panier");
    if (panierString) {
        panier = JSON.parse(panierString);
    }
}

function mettreAJourCompteurPanier() {
    let total = panier.reduce((sum, item) => sum + item.quantite, 0);
    const compteur = document.getElementById("conteurpanier");
    if (compteur) compteur.textContent = total;
}

function afficherPanier() {
    const conteneur = document.getElementById("cartItems");
    const totalElement = document.getElementById("cartTotal");
    
    if (!conteneur) return;
    
    if (panier.length === 0) {
        conteneur.innerHTML = "<p>Panier vide</p>";
        if (totalElement) totalElement.textContent = "Total: 0 €";
        return;
    }
    
    let html = "";
    let total = 0;
    
    for (let article of panier) {
        total += article.prix * article.quantite;
        html += `
            <div class="cart-item">
                <div>
                    <h4>${article.nom}</h4>
                    <div>${article.prix} €</div>
                </div>
                <div>
                    <button class="quantity-btn" onclick="changerQuantite(${article.id}, -1)">-</button>
                    <span>${article.quantite}</span>
                    <button class="quantity-btn" onclick="changerQuantite(${article.id}, 1)">+</button>
                    <button class="remove-item" onclick="supprimerDuPanier(${article.id})">🗑️</button>
                </div>
            </div>
        `;
    }
    
    conteneur.innerHTML = html;
    if (totalElement) totalElement.textContent = "Total: " + total.toFixed(2) + " €";
}

function changerQuantite(id, changement) {
    let article = panier.find(item => item.id === id);
    if (article) {
        article.quantite += changement;
        if (article.quantite <= 0) {
            panier = panier.filter(item => item.id !== id);
        }
    }
    sauvegarderPanier();
    mettreAJourCompteurPanier();
    afficherPanier();
}

function supprimerDuPanier(id) {
    panier = panier.filter(item => item.id !== id);
    sauvegarderPanier();
    mettreAJourCompteurPanier();
    afficherPanier();
}

// ========== COMMANDE ==========
async function passerCommande() {
    if (panier.length === 0) {
        afficherNotification("Panier vide !");
        return;
    }
    
    const numTable = getnumtable();
    if (!numTable) {
        afficherNotification("❌ Veuillez sélectionner un numéro de table !");
        return;
    }
    
    let total = panier.reduce((sum, item) => sum + item.prix * item.quantite, 0);
    
    if (confirm(`Table ${numTable} - Total: ${total.toFixed(2)} €\nConfirmer la commande ?`)) {
        try {
            const commande = await ajouterCommande(panier, "client", numTable);
            console.log("🎉 Commande créée !", commande);
            afficherNotification(`✅ Commande #${commande.numero} (Table ${numTable}) envoyée !`);
            
            // Vider le panier
            panier = [];
            sauvegarderPanier();
            mettreAJourCompteurPanier();
            fermerPanier();
            
            // Recharger les commandes
            setTimeout(chargerMesCommandes, 500);
            
        } catch (error) {
            console.error('❌ Erreur:', error);
            afficherNotification('❌ Erreur lors de la commande');
        }
    }
}

// ========== MES COMMANDES ==========
function chargerMesCommandes() {
    const commandes = getCommandesClient(clientId);
    
    commandes.sort((a, b) => b.dateTimestamp - a.dateTimestamp);
    afficherMesCommandes(commandes);
}

function afficherMesCommandes(commandes) {
    const conteneur = document.getElementById("mesCommandes");
    if (!conteneur) return;
    
    if (commandes.length === 0) {
        conteneur.innerHTML = "<p>Aucune commande</p>";
        return;
    }
    
    let html = "";
    for (let cmd of commandes) {
        let statutTexte = "⏳ En attente";
        let statutClass = "status-attente";
        
        if (cmd.statut === "en_preparation") {
            statutTexte = "🍳 En préparation";
            statutClass = "status-preparation";
        } else if (cmd.statut === "terminee") {
            statutTexte = "✅ Terminée";
            statutClass = "status-termine";
        } else if (cmd.statut === "paye") {
            statutTexte = "💰 Payée";
            statutClass = "status-termine";
        }
        
        const tableInfo = cmd.numeroTable ? ` | Table ${cmd.numeroTable}` : "";
        
        html += `
            <div class="commande-card">
                <div class="commande-header">
                    <strong>Commande #${cmd.numero}${tableInfo}</strong>
                    <span class="status-badge ${statutClass}">${statutTexte}</span>
                </div>
                <div>📅 ${cmd.date}</div>
                <div class="commande-articles">
                    ${cmd.articles.map(a => `<div>${a.quantite}x ${a.nom}</div>`).join('')}
                </div>
                <div class="commande-total">Total: ${cmd.total.toFixed(2)} €</div>
            </div>
        `;
    }
    
    conteneur.innerHTML = html;
}

// ========== UI ==========
function configurerEvenements() {
    document.getElementById("panier")?.addEventListener("click", ouvrirFermerPanier);
    document.getElementById("closeCart")?.addEventListener("click", fermerPanier);
    document.getElementById("checkoutBtn")?.addEventListener("click", passerCommande);
    
    const boutons = document.querySelectorAll(".category-btn");
    boutons.forEach(btn => {
        btn.addEventListener("click", function() {
            boutons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            categorieActuelle = this.getAttribute("data-category");
            afficherProduits();
        });
    });
    
    window.addEventListener("click", function(e) {
        const modal = document.getElementById("cartModal");
        if (e.target === modal) modal.style.display = "none";
    });
    
    // Charger le numéro de table sauvegardé
    const savedTable = localStorage.getItem("numtable");
    const selectElement = document.getElementById("choix");
    if (savedTable && selectElement) {
        selectElement.value = savedTable;
    }
}

function ouvrirFermerPanier() {
    const modal = document.getElementById("cartModal");
    if (modal.style.display === "block") {
        modal.style.display = "none";
    } else {
        modal.style.display = "block";
        afficherPanier();
    }
}

function fermerPanier() {
    const modal = document.getElementById("cartModal");
    if (modal) modal.style.display = "none";
}

function afficherNotification(msg) {
    const notif = document.createElement("div");
    notif.className = "notification";
    notif.textContent = msg;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
}

function getnumtable() {
    const element = document.getElementById('choix');
    if (element && element.value) {
        localStorage.setItem('numtable', element.value);
        return element.value;
    }
    return null;
}

console.log("✅ script-client.js chargé (version serveur)");
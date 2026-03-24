// ========== VARIABLES ==========
let commandesAEncaisser = [];
let commandeSelectionnee = null;
let historiqueVentes = [];
let totalJournalier = 0;
let intervalRafraichissement = null;

// ========== CHARGEMENT ==========
document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Page caisse chargée");
    
    chargerHistorique();
    chargerCommandesAEncaisser();
    mettreAJourStats();
    
    // Écouter les mises à jour
    ecouterMisesAJour(function() {
        console.log("📢 Mise à jour détectée, rechargement...");
        chargerCommandesAEncaisser();
    });
    
    // Rafraîchissement automatique toutes les 3 secondes
    intervalRafraichissement = setInterval(function() {
        chargerCommandesAEncaisser();
    }, 3000);
});

// ========== CHARGER LES COMMANDES À ENCAISSER ==========
function chargerCommandesAEncaisser() {
    console.log("📋 Chargement des commandes à encaisser...");
    
    // Récupérer TOUTES les commandes
    const toutesCommandes = getToutesCommandes();
    
    // Filtrer les commandes TERMINÉES (statut = "terminee")
    commandesAEncaisser = toutesCommandes.filter(cmd => cmd.statut === "terminee");
    
    console.log("💰 Commandes à encaisser trouvées:", commandesAEncaisser.length);
    
    // Afficher
    afficherCommandesAEncaisser();
    mettreAJourSelectCommandes();
}

function afficherCommandesAEncaisser() {
    const container = document.getElementById("commandesEncaisser");
    if (!container) return;
    
    if (commandesAEncaisser.length === 0) {
        container.innerHTML = '<p class="empty-message">Aucune commande à encaisser</p>';
        return;
    }
    
    let html = "";
    for (let i = 0; i < commandesAEncaisser.length; i++) {
        const cmd = commandesAEncaisser[i];
        const selectedClass = (commandeSelectionnee && commandeSelectionnee.id === cmd.id) ? "selected" : "";
        const tableInfo = cmd.numeroTable ? `Table ${cmd.numeroTable}` : "Emporter";
        
        html += `
            <div class="commande-card-caisse ${selectedClass}" onclick="selectionnerCommande(${cmd.id})">
                <div class="commande-header">
                    <strong>Commande #${cmd.numero}</strong>
                    <span class="client-badge">${cmd.type === "client" ? "📱 En ligne" : "🏪 Comptoir"}</span>
                </div>
                <div class="commande-date">📅 ${cmd.date}</div>
                <div class="commande-location">🪑 ${tableInfo}</div>
                <div class="commande-total" style="font-weight: bold; color: #e67e22;">
                    Total: ${cmd.total.toFixed(2)} DT
                </div>
                <div class="commande-articles" style="margin-top: 0.5rem;">
                    ${afficherArticlesSimples(cmd.articles)}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function afficherArticlesSimples(articles) {
    let html = "";
    for (let i = 0; i < articles.length; i++) {
        html += `<div style="font-size: 0.8rem;">${articles[i].quantite}x ${articles[i].nom}</div>`;
    }
    return html;
}

function mettreAJourSelectCommandes() {
    const select = document.getElementById("selectCommande");
    if (!select) return;
    
    let html = '<option value="">-- Choisir une commande --</option>';
    for (let i = 0; i < commandesAEncaisser.length; i++) {
        const cmd = commandesAEncaisser[i];
        html += `<option value="${cmd.id}">#${cmd.numero} - ${cmd.total.toFixed(2)} DT</option>`;
    }
    
    select.innerHTML = html;
    
    // Réattacher l'événement
    select.onchange = function() {
        if (this.value) {
            selectionnerCommande(parseInt(this.value));
        } else {
            commandeSelectionnee = null;
            afficherDetailsCommande();
            afficherCommandesAEncaisser();
        }
    };
}

// ========== SÉLECTION COMMANDE ==========
function selectionnerCommande(commandeId) {
    console.log("🎯 Sélection commande:", commandeId);
    
    // Trouver la commande
    commandeSelectionnee = commandesAEncaisser.find(cmd => cmd.id === commandeId);
    
    if (commandeSelectionnee) {
        console.log("✅ Commande sélectionnée:", commandeSelectionnee);
        afficherDetailsCommande();
        afficherCommandesAEncaisser(); // Pour mettre à jour la surbrillance
        
        // Mettre à jour le select
        const select = document.getElementById("selectCommande");
        if (select) select.value = commandeId;
    }
}

function afficherDetailsCommande() {
    const container = document.getElementById("detailsCommande");
    if (!container) return;
    
    if (!commandeSelectionnee) {
        container.innerHTML = '<p style="color: #7f8c8d;">Sélectionnez une commande pour voir les détails</p>';
        return;
    }
    
    let articlesHtml = "<ul style='margin-top: 0.5rem;'>";
    for (let i = 0; i < commandeSelectionnee.articles.length; i++) {
        const article = commandeSelectionnee.articles[i];
        const sousTotal = article.prix * article.quantite;
        articlesHtml += `<li>${article.quantite}x ${article.nom} - ${sousTotal.toFixed(2)} DT</li>`;
    }
    articlesHtml += "</ul>";
    
    container.innerHTML = `
        <div class="detail-commande">
            <h3 style="color: #e67e22;">Commande #${commandeSelectionnee.numero}</h3>
            <p><strong>Date:</strong> ${commandeSelectionnee.date}</p>
            <p><strong>Table:</strong> ${commandeSelectionnee.numeroTable || 'Emporter'}</p>
            <p><strong>Type:</strong> ${commandeSelectionnee.type === "client" ? "📱 Commande en ligne" : "🏪 Commande au comptoir"}</p>
            <p><strong>Articles:</strong></p>
            ${articlesHtml}
            <div class="total-detail">
                Total à payer: ${commandeSelectionnee.total.toFixed(2)} DT
            </div>
        </div>
    `;
}

// ========== ENCAISSEMENT ==========
async function effectuerPaiement(mode) {
    if (!commandeSelectionnee) {
        alert("❌ Veuillez sélectionner une commande");
        return;
    }
    
    const modeTexte = {
        "especes": "Espèces 💵",
        "carte": "Carte bancaire 💳",
        "mobile": "Paiement mobile 📱"
    };
    
    const confirmation = confirm(
        `🏪 Commande #${commandeSelectionnee.numero}\n` +
        `💰 Total: ${commandeSelectionnee.total.toFixed(2)} DT\n` +
        `💳 Mode: ${modeTexte[mode]}\n\n` +
        `Confirmer l'encaissement ?`
    );
    
    if (confirmation) {
        try {
            // Marquer la commande comme payée sur le serveur
            await payerCommande(commandeSelectionnee.id);
            
            // Ajouter à l'historique local
            const vente = {
                id: commandeSelectionnee.id,
                numero: commandeSelectionnee.numero,
                date: new Date().toLocaleString(),
                dateTimestamp: Date.now(),
                total: commandeSelectionnee.total,
                mode: modeTexte[mode],
                articles: commandeSelectionnee.articles,
                type: commandeSelectionnee.type,
                table: commandeSelectionnee.numeroTable
            };
            
            historiqueVentes.unshift(vente);
            sauvegarderHistorique();
            
            // Mettre à jour le total journalier
            totalJournalier += commandeSelectionnee.total;
            sauvegarderTotalJournalier();
            
            // Réinitialiser la sélection
            commandeSelectionnee = null;
            
            // Rafraîchir l'affichage
            chargerCommandesAEncaisser();
            afficherHistorique();
            mettreAJourStats();
            
            // Notification
            afficherNotificationCaisse(`✅ Encaissement #${vente.numero} effectué (${vente.total.toFixed(2)} €)`);
            
        } catch (error) {
            console.error('❌ Erreur paiement:', error);
            afficherNotificationCaisse('❌ Erreur lors du paiement');
        }
    }
}

// ========== HISTORIQUE ==========
function chargerHistorique() {
    const historique = localStorage.getItem("historique_ventes_caisse");
    if (historique) {
        try {
            historiqueVentes = JSON.parse(historique);
        } catch(e) {
            historiqueVentes = [];
        }
    }
    
    const total = localStorage.getItem("total_journalier_caisse");
    if (total) {
        totalJournalier = parseFloat(total);
    }
    
    afficherHistorique();
}

function sauvegarderHistorique() {
    localStorage.setItem("historique_ventes_caisse", JSON.stringify(historiqueVentes));
}

function sauvegarderTotalJournalier() {
    localStorage.setItem("total_journalier_caisse", totalJournalier.toString());
}

function afficherHistorique() {
    const container = document.getElementById("historiqueVentes");
    if (!container) return;
    
    if (historiqueVentes.length === 0) {
        container.innerHTML = '<p class="empty-message">Aucune vente enregistrée</p>';
        return;
    }
    
    let html = "";
    const dernieresVentes = historiqueVentes.slice(0, 10);
    
    for (let i = 0; i < dernieresVentes.length; i++) {
        const vente = dernieresVentes[i];
        const tableInfo = vente.table ? `Table ${vente.table}` : "Emporter";
        
        html += `
            <div class="vente-item">
                <div class="vente-header">
                    <span>#${vente.numero}</span>
                    <span style="color: #e67e22;">${vente.total.toFixed(2)} DT</span>
                </div>
                <div class="vente-details">
                    ${vente.mode} - ${vente.date} - ${tableInfo}
                </div>
                <div style="font-size: 0.7rem; color: #7f8c8d; margin-top: 0.2rem;">
                    ${vente.type === "client" ? "📱 En ligne" : "🏪 Comptoir"}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

async function mettreAJourStats() {
    try {
        const stats = await getStats();
        const totalElement = document.getElementById("caissierTotal");
        if (totalElement) {
            totalElement.textContent = totalJournalier.toFixed(2);
        }
    } catch (error) {
        console.error('Erreur stats:', error);
    }
}

// ========== RAFRAÎCHISSEMENT ==========
function rafraichirCaisse() {
    console.log("🔄 Rafraîchissement manuel");
    chargerCommandesAEncaisser();
    afficherNotificationCaisse("🔄 Commandes mises à jour");
}

// ========== RÉINITIALISATION JOURNALIÈRE ==========
function reinitialiserJournalier() {
    if (confirm("💰 Réinitialiser le compteur journalier ?\nCette action ne supprime pas l'historique.")) {
        totalJournalier = 0;
        sauvegarderTotalJournalier();
        mettreAJourStats();
        afficherNotificationCaisse("💰 Compteur journalier réinitialisé");
    }
}

function afficherNotificationCaisse(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(function() {
        if (notification && notification.remove) {
            notification.remove();
        }
    }, 2000);
}

// Ajouter le bouton de réinitialisation
setTimeout(function() {
    const statsDiv = document.querySelector(".stats-caisse");
    if (statsDiv) {
        const resetBtn = document.createElement("button");
        resetBtn.textContent = "🔄 Réinitialiser journalier";
        resetBtn.className = "refresh-btn";
        resetBtn.style.marginLeft = "0.5rem";
        resetBtn.style.background = "#dc3545";
        resetBtn.onclick = reinitialiserJournalier;
        statsDiv.appendChild(resetBtn);
    }
}, 500);

window.addEventListener("beforeunload", function() {
    if (intervalRafraichissement) {
        clearInterval(intervalRafraichissement);
    }
});

console.log("✅ script-caisse.js chargé (version serveur)");
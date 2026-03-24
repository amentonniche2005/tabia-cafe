// ========== VARIABLES ==========
let intervalle = null;

// ========== CHARGEMENT ==========
document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Page comptoir chargée");
    
    chargerCommandes();
    
    // Écouter les mises à jour
    ecouterMisesAJour(function() {
        console.log("📢 Mise à jour reçue !");
        chargerCommandes();
    });
    
    // Rafraîchir toutes les 3 secondes (fallback)
    intervalle = setInterval(function() {
        chargerCommandes();
    }, 3000);
});

// ========== CHARGER COMMANDES ==========
function chargerCommandes() {
    console.log("📋 Chargement des commandes...");
    
    const toutes = getToutesCommandes();
    console.log("📦 Commandes trouvées:", toutes.length);
    
    // Séparer par statut (ne pas afficher les commandes payées)
    const enAttente = [];
    const enPreparation = [];
    const terminees = [];
    
    for (let i = 0; i < toutes.length; i++) {
        const cmd = toutes[i];
        if (cmd.statut === "en_attente") {
            enAttente.push(cmd);
        } else if (cmd.statut === "en_preparation") {
            enPreparation.push(cmd);
        } else if (cmd.statut === "terminee") {
            terminees.push(cmd);
        }
        // Les commandes "paye" ne sont pas affichées
    }
    
    // Afficher
    afficherColonne("commandesAttente", enAttente, "attente");
    afficherColonne("commandesPreparation", enPreparation, "preparation");
    afficherColonne("commandesTerminees", terminees, "terminee");
    
    // Mettre à jour les stats
    document.getElementById("nbAttente").textContent = enAttente.length;
    document.getElementById("nbPreparation").textContent = enPreparation.length;
    document.getElementById("nbTerminees").textContent = terminees.length;
}

function afficherColonne(containerId, commandes, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (commandes.length === 0) {
        container.innerHTML = "<p class='empty-message'>Aucune commande</p>";
        return;
    }
    
    let html = "";
    for (let i = 0; i < commandes.length; i++) {
        const cmd = commandes[i];
        const tableInfo = cmd.numeroTable ? `<span class="table-badge">Table ${cmd.numeroTable}</span>` : "";
        
        html += `
            <div class="commande-card" data-id="${cmd.id}">
                <div class="commande-header">
                    <span class="commande-numero">#${cmd.numero}</span>
                    <div>
                        ${tableInfo}
                        <span class="client-badge">${cmd.type === "client" ? "📱 En ligne" : "🏪 Comptoir"}</span>
                    </div>
                </div>
                <div>📅 ${cmd.date}</div>
                <div class="commande-articles">
                    ${afficherArticles(cmd.articles)}
                </div>
                <div class="commande-total">Total: ${cmd.total.toFixed(2)} €</div>
                <div class="commande-actions">
                    ${getBoutonsAction(cmd, type)}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function afficherArticles(articles) {
    let html = "";
    for (let i = 0; i < articles.length; i++) {
        html += `<div>${articles[i].quantite}x ${articles[i].nom}</div>`;
    }
    return html;
}

function getBoutonsAction(commande, type) {
    if (type === "attente") {
        return `<button class="btn-preparer" onclick="demarrerPreparation(${commande.id})">👨‍🍳 Préparer</button>`;
    } else if (type === "preparation") {
        return `<button class="btn-terminer" onclick="terminerCommande(${commande.id})">✅ Terminer</button>`;
    } else {
        return `<button class="btn-terminer" onclick="supprimerCommande(${commande.id})">🗑️ Supprimer</button>`;
    }
}

// ========== ACTIONS ==========
async function demarrerPreparation(id) {
    if (confirm("Démarrer la préparation ?")) {
        try {
            await changerStatutCommande(id, "en_preparation");
            chargerCommandes();
            afficherNotification("✅ Préparation démarrée");
        } catch (error) {
            afficherNotification("❌ Erreur");
        }
    }
}

async function terminerCommande(id) {
    if (confirm("Terminer cette commande ?")) {
        try {
            await changerStatutCommande(id, "terminee");
            chargerCommandes();
            afficherNotification("🎉 Commande terminée");
        } catch (error) {
            afficherNotification("❌ Erreur");
        }
    }
}

async function supprimerCommande(id) {
    if (confirm("Supprimer cette commande ?")) {
        try {
            await supprimerCommande(id);
            chargerCommandes();
            afficherNotification("🗑️ Commande supprimée");
        } catch (error) {
            afficherNotification("❌ Erreur");
        }
    }
}

function rafraichirCommandes() {
    chargerCommandes();
    afficherNotification("🔄 Commandes mises à jour");
}

function afficherNotification(msg) {
    const notif = document.createElement("div");
    notif.className = "notification";
    notif.textContent = msg;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
}

// Nettoyer l'intervalle
window.addEventListener("beforeunload", function() {
    if (intervalle) clearInterval(intervalle);
});

console.log("✅ script-comptoir.js chargé (version serveur)");
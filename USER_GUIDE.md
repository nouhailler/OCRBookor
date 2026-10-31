# USER_GUIDE.md — Manuel Utilisateur OCRBookor

Bienvenue dans **OCRBookor**, votre studio complet de numérisation et de transformation de livres numérisés en livres numériques exploitables.

---

## Guide d'Utilisation en 6 Étapes

### Étape 1 : Bibliothèque & Création de Projet
1. Cliquez sur **« Importer un PDF »** ou glissez-déposez votre livre numérisé dans la zone dédiée.
2. Pour tester immédiatement sans fichier PDF sous la main, cliquez sur **« Charger le Corpus de Test »** : l'application charge instantanément les trois livres de référence (*Le Mystère de la Chambre Jaune*, *Candide 1759*, et les *Fables Illustrées*).
3. Cliquez sur **« Ouvrir »** sur la carte du projet souhaité.

### Étape 2 : Analyse du Document & Prétraitement
1. Consultez le diagnostic automatique :
   - **Scan pur (100% images) :** Nécessite une reconnaissance OCR intégrale.
   - **Texte natif :** Extraction ultra-rapide sans perte.
   - **Hybride :** Combine les deux approches.
2. Configurez les filtres d'amélioration d'image selon l'état du livre :
   - *Redressement automatique (deskew)* : pour redresser les pages scannées de travers.
   - *Contraste & Binarisation* : très utile pour les papiers jaunis ou à faible encrage.
3. Cliquez sur **« Lancer la reconnaissance OCR »**.

### Étape 3 : Reconnaissance OCR
1. Cliquez sur **« Démarrer l’OCR »** pour lancer le traitement automatique page par page.
2. Suivez la progression en temps réel, le temps écoulé et les scores de confiance.
3. Les pages présentant des anomalies (bruit élevé, confiance < 65%) sont immédiatement signalées.
4. Dès qu'une page est prête, vous pouvez basculer sur l'écran de correction sans attendre la fin du livre.

### Étape 4 : Éditeur de Correction Bi-Fenêtre
1. **Partie gauche :** Visualisez le scan haute résolution. Utilisez le zoom (jusqu'à 300%), la rotation, ou activez le mode fort contraste. Les boîtes englobantes s'allument en violet dès que vous survolez un paragraphe !
2. **Partie droite :** Corrigez le texte extrait.
3. Cliquez sur **« Typo française »** pour appliquer automatiquement les guillemets `« »`, les espaces insécables et les ligatures `œ`.
4. Cliquez sur **« Résoudre césures »** pour recoller automatiquement les mots coupés en bout de ligne.
5. Cliquez sur **« Marquer comme validée »** une fois la page relue.
6. Naviguez d'une page à l'autre avec les flèches ou le sélecteur.

### Étape 5 : Structure Éditoriale & Illustrations
1. **Chapitres :** Cliquez sur **« Auto-détecter les chapitres »** pour générer l'arborescence à partir des titres. Vous pouvez renommer, monter, descendre ou changer le niveau hiérarchique (H1, H2, H3).
2. **Illustrations :** Vérifiez les gravures extraites et saisissez leur légende éditoriale.
3. **Métadonnées :** Complétez le titre, l'auteur, l'année, l'éditeur et le numéro ISBN.

### Étape 6 : Export Multi-Formats & Liseuse
1. Prévisualisez le rendu dans la **liseuse EPUB 3 intégrée** (choisissez le thème Clair, Sépia ou Nuit, et ajustez la taille de police).
2. Cliquez sur le bouton de téléchargement de votre choix :
   - **Télécharger .epub** : Livre numérique prêt pour liseuse.
   - **Télécharger .md** : Fichier Markdown structuré.
   - **Télécharger .txt** : Texte brut encodé en UTF-8.
   - **Télécharger .html** : Page web autonome.
   - **Télécharger .json** : Sauvegarde complète du projet pour archivage.

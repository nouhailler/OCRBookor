# INSTALLATION.md — Guide d’Installation Debian 13 & GNU/Linux

Ce document détaille la procédure d'installation et de déploiement d'**OCRBookor** sur Debian 13 (Trixie) et distributions Linux dérivées (Ubuntu, Mint, Fedora).

---

## 1. Prérequis Matériels

- **Système d'exploitation :** Linux Debian 13 (64-bit), Ubuntu 22.04+ ou macOS / Windows.
- **Processeur :** CPU 4 cœurs standard (aucun GPU dédié requis).
- **Mémoire RAM :** 8 Go minimum (16 Go recommandés pour les gros volumes).
- **Stockage :** 2 Go d'espace libre pour l'application, les modèles linguistiques et les caches de pages.

---

## 2. Dépendances Système Linux

Exécutez dans un terminal :

```bash
# Mise à jour des dépôts
sudo apt update

# Installation des paquets système indispensables
sudo apt install -y \
    tesseract-ocr \
    tesseract-ocr-fra \
    tesseract-ocr-fra-old \
    poppler-utils \
    nodejs \
    npm \
    python3 \
    python3-pip
```

---

## 3. Installation d'OCRBookor

```bash
# Cloner le dépôt officiel
git clone https://github.com/votre-compte/ocrbookor.git
cd ocrbookor

# Installer les dépendances Node.js et de build
npm install
```

---

## 4. Démarrage de l'Application

### En mode Développement :
```bash
npm run dev
```
L'interface est accessible dans votre navigateur à l'adresse :  
`http://localhost:3000`

### En mode Production :
```bash
npm run build
npm run preview
```

---

## 5. Fonctionnement Hors-Ligne & Confidentialité

Une fois les dépendances installées lors de la première initialisation, **OCRBookor fonctionne intégralement hors-ligne sans aucune connexion Internet active**. Les documents importés restent strictement confinés à votre ordinateur local.

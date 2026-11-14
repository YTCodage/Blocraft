# 🏍️ MotoGP™ 3D — Grand Prix Championship

Jeu de simulation et de course MotoGP en 3D jouable directement dans votre navigateur Web, développé avec **Three.js** et **Web Audio API**.

![MotoGP 3D](https://raw.githubusercontent.com/YTCodage/Blocraft/main/assets/favicon.svg)

## 🌟 Fonctionnalités

- **Prototypes 1000cc officiels** : Modèles 3D détaillés avec ailerons aéro (*winglets*), disques de frein en carbone, échappement titane bleui et pilote articulé.
- **Pilotage réaliste & sensations fortes** :
  - Angle d'inclinaison maximal jusqu'à **64°** (avec étincelles qui fusent du slider de genou sur le bitume).
  - Vitesse de pointe dépassant les **355 km/h** sur les longues lignes droites.
  - Aspiration aérodynamique (*slipstream / drafting*) pour doubler au freinage.
  - Système de récupération d'énergie **KERS / Boost Nitro**.
- **3 Circuits réels modélisés** :
  1. 🇫🇷 **Circuit Bugatti Le Mans** (Courbe Dunlop, La Chapelle, Musée)
  2. 🇮🇹 **Autodromo del Mugello** (Ligne droite de 1.1 km à 355 km/h, Arrabbiata)
  3. 🇪🇸 **Circuit Ricardo Tormo Valencia** (Amphithéâtre stadium)
- **8 Écuries & Pilotes officiels** : Bagnaia (#63), Quartararo (#20), Marc Márquez (#93), Martín (#89), Binder (#33), Espargaró (#41), Bezzecchi (#72), Acosta (#31).
- **Moteur Audio procédural** : Rugissement de moteur 4-temps V4 haute fidélité, détonations au passage des rapports (*quickshifter*), sifflement du vent et crissement de pneus.
- **HUD & Télémétrie Broadcast** : Compteur digital, compte-tours avec shift-lights, angle d'inclinaison, tour de classement en temps réel et minimap 2D vectorielle.
- **Multi-plateforme** : Compatible Clavier PC, Manettes de jeu (Xbox / PlayStation) et Écrans tactiles mobiles.

## 🚀 Démarrage rapide

### 1. Ouvrir directement
Ouvrez simplement le fichier `index.html` dans un navigateur moderne (Chrome, Edge, Firefox, Safari).

### 2. Lancer un serveur local
```bash
# Avec Python
python3 -m http.server 8000

# Ou avec Node.js
npx serve .
```
Puis accédez à `http://localhost:8000`.

### 3. Recompiler le projet
```bash
npm install
npm run build
npm test
```

## 🎮 Commandes

| Action | Clavier | Manette | Mobile |
| :--- | :--- | :--- | :--- |
| **Accélérer** | Z / W / ↑ | RT / R2 | Bouton GAZ |
| **Frein avant** | S / ↓ | LT / L2 | Bouton FREIN |
| **Pencher G/D** | Q / D ou ← / → | Stick gauche | Boutons ◀ / ▶ |
| **Frein arrière** | Espace | B / Rond | — |
| **Boost KERS** | Shift (Maj) | A / Croix | Bouton BOOST |
| **Caméra** | C | Y / Triangle | — |
| **Replacer moto** | R | — | — |
| **Pause** | P / Échap | Start | — |
| **Son On/Off** | M | — | — |

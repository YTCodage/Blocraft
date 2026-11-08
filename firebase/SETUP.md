# Activer les mondes Admin du projet `blocraft`

Le SDK web est intégré et livré localement dans `assets/vendor/blocraft-cloud.min.js`.
**La configuration web/API key est publique : ce n'est ni un compte administrateur,
ni une autorisation de déployer les règles.** Aucun fichier de compte de service,
mot de passe ou jeton privé n'est nécessaire dans le dépôt ou dans le chat.

## Dans la console Firebase, avec ton propre compte propriétaire

1. Ouvrir le projet **blocraft**, puis **Authentication → Sign-in method** et
   activer **Anonyme**. Les joueurs ordinaires ne se connectent pas à Firebase ;
   le SDK est chargé uniquement quand on rejoint un monde Admin.
2. Créer la base **Cloud Firestore `(default)`**, de préférence dans une région
   européenne. Partir en **mode production**, jamais avec des règles publiques.
3. Dans **Firestore → Règles**, publier le contenu de
   [`firestore.rules`](firestore.rules). Ne pas utiliser `allow read, write: if true`.
   Si ce projet sert déjà à une autre application, intégrer ces chemins aux règles
   existantes sans supprimer ses autorisations nécessaires.
4. Dans **Authentication → Settings → Authorized domains**, vérifier/ajouter
   `ytcodage.github.io` (et les domaines de développement réellement utilisés).
   Si une restriction de référents est configurée pour la clé web dans Google
   Cloud, autoriser ce site. Ne pas activer App Check obligatoire sans intégrer
   d'abord son fournisseur dans le client.

Pour déployer les règles et l'exemption d'indexation du texte des sauvegardes,
**depuis ton ordinateur authentifié**, on peut aussi utiliser :

```sh
npx firebase-tools login
npx firebase-tools deploy --only firestore --project blocraft
```

Le projet est sélectionné dans `.firebaserc`. L'exemption `state.payload` est
configurée dans `firestore.indexes.json` ; elle évite d'indexer de gros textes qui
ne sont jamais recherchés. Les règles sont fournies, mais **leur déploiement n'est
pas effectué par la simple publication du site GitHub Pages**.

## Ce qui est stocké

- `adminProfiles/{uid}` : pseudo actuel et date de modification ; ce document n'est
  lisible/modifiable que par le même utilisateur Firebase anonyme.
- `adminWorlds/overworld`, `adminWorlds/flat`, `adminWorlds/oneblock` : hôte actif,
  session, adresse WebRTC et bail de 45 secondes, renouvelé toutes les 12 secondes.
- `adminWorlds/{type}/state/manifest` et `state/0-*` / `state/1-*` : dernier état
  sauvegardé, segmenté en deux banques alternées, publication atomique. Les blocs,
  dimensions représentées dans la sauvegarde du jeu, circuits, météo, progression,
  véhicules et inventaire du navigateur hôte font partie de ce point de reprise.

Le pseudo/profil reste aussi dans le navigateur. La connexion anonyme fournit un
identifiant technique, **pas un compte Admin vérifié**. Comme demandé, n'importe
qui peut choisir le profil Admin et son pseudo ; les mondes ne doivent donc pas
contenir de données privées. Les règles protègent l'écriture des checkpoints par
l'UID de l'hôte et exigent une connexion Firebase, mais elles ne prouvent pas une
qualité d'administrateur. Pour de vrais comptes réservés au personnel, il faudra
un fournisseur de connexion et des rôles attribués côté serveur.

## Limites et coûts

- Firebase conserve les données et arbitre l'hôte ; **ce n'est pas un serveur de
  simulation 24 h/24**. Un navigateur doit rester ouvert et actif. Après sa fermeture,
  un autre Admin peut reprendre le checkpoint. Si le bail n'a pas été libéré proprement,
  attendre jusqu'à 45 secondes puis cliquer de nouveau sur le même type.
- Checkpoint toutes les 30 secondes, plus une tentative lors d'une sortie propre.
  Une fermeture brutale peut perdre les changements depuis le dernier checkpoint.
  Le jeu ne garantit pas la fin d'une requête asynchrone pendant la fermeture d'un onglet.
- Plusieurs Admins sont acceptés par l'hôte WebRTC (test avec trois), sans créer
  un autre monde lorsque quelqu'un rejoint. La capacité réelle dépend du navigateur,
  du réseau et de la machine ; ce n'est pas une garantie de capacité illimitée.
- Les mouvements passent par WebRTC, **pas par des écritures Firestore à chaque image**.
  La taille du checkpoint est limitée à **8 Mio** ; le cache local reste disponible
  en cas d'erreur. Les accès Firestore et leur facturation augmentent avec la taille
  et la durée des sessions : surveiller quotas et budget dans Firebase/Google Cloud.
- Les inventaires/coffres ne sont pas des transactions multijoueurs autoritaires.
  Les sauvegardes normales hors monde Admin et l'état QA ne sont pas envoyés au cloud.
- Le SDK Analytics fourni en exemple n'est **pas activé** : pas de suivi Analytics
  ajouté sans besoin de gameplay.

## Validation

```sh
npm run build:cloud
npm run test:cloud
npm run test:adminrealm
```

`test:cloud` vérifie l'algorithme transactionnel avec une base en mémoire.
`test:adminrealm` emploie cette base simulée et **de vrais canaux PeerJS/WebRTC** :
3 Admins, blocs/positions/TP, ciblage, 3 types distincts, départ/reprise et erreur
Firebase sans copie locale silencieuse. Ces tests **ne prouvent pas** que le projet
Firebase réel est activé ni que les règles y ont été déployées. Le sandbox n'a pas
accès aux hôtes Firebase et n'a pas les droits d'administration du projet.

Après activation, vérifier sur deux ou trois appareils : rejoindre le même type,
poser un bloc, sortir proprement, puis reprendre depuis un autre navigateur.

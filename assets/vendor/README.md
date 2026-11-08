# PeerJS browser client

- Package: `peerjs`, version **1.5.5**.
- Source: https://registry.npmjs.org/peerjs/-/peerjs-1.5.5.tgz
- Bundled file: `package/dist/peerjs.min.js` (unmodified).
- License: MIT; see `peerjs.LICENSE`.

Loaded on demand by the multiplayer feature. The default public PeerJS Cloud
service provides signaling only. Single-player gameplay needs no cloud service.

# Firebase browser SDK

- Package: firebase **12.19.0**, Apache-2.0; see firebase.LICENSE and embedded notices.
- Built from src/firebase-cloud.js and src/cloud-store.mjs using npm run build:cloud.
- Modular Authentication + Firestore only. Analytics is not initialized.
- Loaded only when joining a common Admin world. Normal single-player is unchanged.
- Registry, lease and checkpoints: project blocraft. Console activation/rules deployment
  are documented in firebase/SETUP.md.

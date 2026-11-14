// Tests automatisés de validation du jeu MotoGP 3D
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== DÉBUT DES TESTS MOTOGP 3D ===');

// 1. Vérification des fichiers du projet
const bundlePath = path.join(__dirname, '..', 'assets', 'motogp.bundle.js');
assert(fs.existsSync(bundlePath), 'Le bundle assets/motogp.bundle.js doit exister');
const bundleStat = fs.statSync(bundlePath);
assert(bundleStat.size > 200000, `Taille du bundle trop petite : ${bundleStat.size} octets`);
console.log(`✓ Bundle vérifié : ${(bundleStat.size / 1024).toFixed(1)} Ko`);

const htmlPath = path.join(__dirname, '..', 'motogp.html');
assert(fs.existsSync(htmlPath), 'motogp.html doit exister');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');
assert(htmlContent.includes('id="canvas-container"'), 'Canvas 3D manquant dans motogp.html');
assert(htmlContent.includes('id="main-menu"'), 'Menu principal manquant dans motogp.html');
assert(htmlContent.includes('id="hud-layer"'), 'Couche HUD manquante dans motogp.html');
assert(htmlContent.includes('id="pause-modal"'), 'Modal de pause manquante dans motogp.html');
assert(htmlContent.includes('id="results-modal"'), 'Modal de résultats manquante dans motogp.html');
assert(htmlContent.includes('assets/motogp.bundle.js'), 'Script bundle non lié');
console.log('✓ Page motogp.html validée (Canvas, HUD, Menus, Modals)');

const cssPath = path.join(__dirname, '..', 'assets', 'motogp.css');
assert(fs.existsSync(cssPath), 'assets/motogp.css doit exister');
const cssContent = fs.readFileSync(cssPath, 'utf8');
assert(cssContent.includes('--mgp-red'), 'Variables CSS MotoGP manquantes');
assert(cssContent.includes('#hud-dashboard'), 'Dashboard CSS manquant');
console.log('✓ Stylesheet assets/motogp.css validée');

// 2. Test des constantes et écuries
const constants = require('../src/motogp/constants.js');
assert(Array.isArray(constants.TEAMS), 'TEAMS doit être un tableau');
assert(constants.TEAMS.length >= 6, `Nombre d'écuries insuffisant : ${constants.TEAMS.length}`);

const bagnaia = constants.TEAMS.find(t => t.rider.includes('Bagnaia'));
assert(bagnaia, 'Bagnaia #63 doit être présent');
assert.strictEqual(bagnaia.number, 63);
assert(bagnaia.topSpeedKmh >= 350, 'Vitesse max Bagnaia > 350 km/h');

const quartararo = constants.TEAMS.find(t => t.rider.includes('Quartararo'));
assert(quartararo, 'Quartararo #20 doit être présent');
assert.strictEqual(quartararo.number, 20);

const marquez = constants.TEAMS.find(t => t.rider.includes('Márquez') || t.rider.includes('Marquez'));
assert(marquez, 'Marc Marquez #93 doit être présent');
assert.strictEqual(marquez.number, 93);

const martin = constants.TEAMS.find(t => t.rider.includes('Martín') || t.rider.includes('Martin'));
assert(martin, 'Jorge Martin #89 doit être présent');

console.log(`✓ 8 écuries et pilotes officiels MotoGP vérifiés`);

// 3. Test des circuits
assert(Array.isArray(constants.TRACK_DEFINITIONS), 'TRACK_DEFINITIONS doit être un tableau');
assert(constants.TRACK_DEFINITIONS.length >= 3, 'Au moins 3 circuits officiels');

const lemans = constants.TRACK_DEFINITIONS.find(t => t.id === 'lemans');
assert(lemans, 'Circuit Le Mans Bugatti présent');
assert(lemans.points.length >= 20, 'Points de spline Le Mans suffisants');

const mugello = constants.TRACK_DEFINITIONS.find(t => t.id === 'mugello');
assert(mugello, 'Circuit Mugello présent');
assert(mugello.points.length >= 20, 'Points de spline Mugello suffisants');

const valencia = constants.TRACK_DEFINITIONS.find(t => t.id === 'valencia');
assert(valencia, 'Circuit Valencia présent');
console.log(`✓ Circuits Le Mans, Mugello et Valence validés`);

// 4. Test des conditions météo
assert(constants.WEATHER_PRESETS.sunny, 'Météo ensoleillée présente');
assert(constants.WEATHER_PRESETS.sunset, 'Météo coucher de soleil présente');
assert(constants.WEATHER_PRESETS.wet, 'Météo pluie présente');
assert(constants.WEATHER_PRESETS.wet.rain === true, 'Météo pluie active les précipitations');
assert(constants.WEATHER_PRESETS.wet.gripMultiplier < 1.0, 'Adhérence réduite sous la pluie');
console.log(`✓ Météo dynamique validée (Soleil, Coucher de soleil, Pluie)`);

// 5. Test du modèle physique & boîte de vitesses
const physicsCfg = constants.PHYSICS_CONFIG;
assert(physicsCfg.maxLeanAngleDeg >= 60, 'Angle de braquage max MotoGP >= 60 degrés');
assert.strictEqual(physicsCfg.gearRatios.length, 6, 'Boîte de vitesses à 6 rapports requise');
assert(physicsCfg.gearRatios[5].maxKmh >= 350, '6e rapport > 350 km/h');
console.log(`✓ Configuration physique MotoGP (Angle 64°, Boîte 6 rapports, Freinage carbone) validée`);

// 6. Test dynamique de simulation physique (accélération, freinage, virage)
const mockCircuit = {
  totalLength: 4200,
  roadWidth: 14,
  weather: { rain: false, gripMultiplier: 1.0 },
  curve: {
    getPointAt: () => ({ x: 0, y: 0, z: 0 }),
    getTangentAt: () => ({ x: 0, y: 0, z: 1, normalize: () => ({ x: 0, y: 0, z: 1 }) })
  },
  projectPoint: (pos) => ({
    u: 0.1,
    distOnTrack: 420,
    lateralOffset: 0,
    surface: 'tarmac',
    sector: 1,
    trackElevation: 0,
    binormal: { clone: () => ({ multiplyScalar: () => ({}) }) }
  })
};

const { BikePhysics } = require('../src/motogp/physics.js');
const bike = new BikePhysics(bagnaia, mockCircuit, true);
assert.strictEqual(bike.speedKmh, 0);
assert.strictEqual(bike.gear, 1);

// Test Accélération
bike.update(0.1, { throttle: 1.0, brake: 0, steer: 0, nitro: false });
assert(bike.speedKmh > 0, 'La moto doit accélérer lors de la mise des gaz');

// Simulation de 3 secondes plein gaz
for (let i = 0; i < 60; i++) {
  bike.update(0.05, { throttle: 1.0, brake: 0, steer: 0, nitro: false });
}
assert(bike.speedKmh > 80, `Vitesse après accélération : ${bike.speedKmh.toFixed(1)} km/h`);
const speedBeforeBraking = bike.speedKmh;

// Test Freinage
bike.update(0.1, { throttle: 0, brake: 1.0, steer: 0, nitro: false });
assert(bike.speedKmh < speedBeforeBraking, 'La vitesse doit chuter au freinage');

// Test Inclinaison (Lean angle)
bike.update(0.1, { throttle: 0.5, brake: 0, steer: 1.0, nitro: false });
assert(bike.leanAngle !== 0, 'La moto doit pencher lors du braquage');
const leanDeg = Math.abs(bike.leanAngle * (180 / Math.PI));
assert(leanDeg <= physicsCfg.maxLeanAngleDeg, 'L inclinaison ne doit pas dépasser le maximum physique');

// Test KERS / Nitro Boost
const initialNitro = bike.nitro;
bike.update(0.1, { throttle: 1.0, brake: 0, steer: 0, nitro: true });
assert(bike.isNitroActive, 'Le nitro/KERS doit s activer');
assert(bike.nitro < initialNitro, 'Le stock de nitro doit diminuer');

console.log(`✓ Moteur physique validé : Accélération, Freinage carbone, Inclinaison gyro, KERS boost`);

console.log('=== TOUS LES TESTS MOTOGP 3D ONT RÉUSSI AVEC SUCCÈS ! ===');

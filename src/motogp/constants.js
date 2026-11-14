// Constantes et configurations officielles du jeu MotoGP 3D

export const TEAMS = [
  {
    id: 'ducati',
    name: 'Ducati Lenovo Team',
    rider: 'Francesco Bagnaia',
    number: 63,
    country: 'IT',
    color: '#d50000',
    accentColor: '#1a1a1a',
    numberColor: '#ffffff',
    suitColor: '#c20000',
    helmetColor: '#d50000',
    sponsor: 'LENOVO',
    stats: {
      speed: 99,
      acceleration: 98,
      handling: 90,
      braking: 94
    },
    topSpeedKmh: 358,
    accelFactor: 1.08,
    handlingFactor: 0.95,
    brakingFactor: 1.02
  },
  {
    id: 'yamaha',
    name: 'Monster Energy Yamaha',
    rider: 'Fabio Quartararo',
    number: 20,
    country: 'FR',
    color: '#0033aa',
    accentColor: '#0a88ff',
    numberColor: '#ffffff',
    suitColor: '#052366',
    helmetColor: '#002888',
    sponsor: 'MONSTER',
    stats: {
      speed: 91,
      acceleration: 92,
      handling: 99,
      braking: 93
    },
    topSpeedKmh: 346,
    accelFactor: 0.96,
    handlingFactor: 1.10,
    brakingFactor: 1.0
  },
  {
    id: 'gresini',
    name: 'Gresini Racing MotoGP',
    rider: 'Marc Márquez',
    number: 93,
    country: 'ES',
    color: '#3ba3ff',
    accentColor: '#e60000',
    numberColor: '#ffffff',
    suitColor: '#2b87dc',
    helmetColor: '#e60000',
    sponsor: 'RED BULL',
    stats: {
      speed: 96,
      acceleration: 95,
      handling: 97,
      braking: 99
    },
    topSpeedKmh: 354,
    accelFactor: 1.02,
    handlingFactor: 1.06,
    brakingFactor: 1.08
  },
  {
    id: 'pramac',
    name: 'Prima Pramac Racing',
    rider: 'Jorge Martín',
    number: 89,
    country: 'ES',
    color: '#7b1fa2',
    accentColor: '#ffffff',
    numberColor: '#ffea00',
    suitColor: '#6a1b9a',
    helmetColor: '#8e24aa',
    sponsor: 'PRIMA',
    stats: {
      speed: 98,
      acceleration: 99,
      handling: 93,
      braking: 93
    },
    topSpeedKmh: 356,
    accelFactor: 1.09,
    handlingFactor: 0.98,
    brakingFactor: 1.0
  },
  {
    id: 'ktm',
    name: 'Red Bull KTM Factory',
    rider: 'Brad Binder',
    number: 33,
    country: 'ZA',
    color: '#ff6600',
    accentColor: '#0a192f',
    numberColor: '#ffffff',
    suitColor: '#e65c00',
    helmetColor: '#ff6600',
    sponsor: 'KTM MOTUL',
    stats: {
      speed: 95,
      acceleration: 96,
      handling: 91,
      braking: 98
    },
    topSpeedKmh: 352,
    accelFactor: 1.04,
    handlingFactor: 0.94,
    brakingFactor: 1.06
  },
  {
    id: 'aprilia',
    name: 'Aprilia Racing',
    rider: 'Aleix Espargaró',
    number: 41,
    country: 'ES',
    color: '#1a1a1a',
    accentColor: '#ff0033',
    numberColor: '#00e676',
    suitColor: '#222222',
    helmetColor: '#ff1744',
    sponsor: 'APRILIA',
    stats: {
      speed: 94,
      acceleration: 94,
      handling: 96,
      braking: 95
    },
    topSpeedKmh: 350,
    accelFactor: 1.0,
    handlingFactor: 1.03,
    brakingFactor: 1.02
  },
  {
    id: 'vr46',
    name: 'Pertamina Enduro VR46',
    rider: 'Marco Bezzecchi',
    number: 72,
    country: 'IT',
    color: '#ffee00',
    accentColor: '#d50000',
    numberColor: '#000000',
    suitColor: '#ffea00',
    helmetColor: '#ffee00',
    sponsor: 'VR46 RACING',
    stats: {
      speed: 95,
      acceleration: 94,
      handling: 94,
      braking: 93
    },
    topSpeedKmh: 352,
    accelFactor: 1.01,
    handlingFactor: 1.01,
    brakingFactor: 1.0
  },
  {
    id: 'gasgas',
    name: 'Red Bull GASGAS Tech3',
    rider: 'Pedro Acosta',
    number: 31,
    country: 'ES',
    color: '#cc0022',
    accentColor: '#ffffff',
    numberColor: '#ffeb3b',
    suitColor: '#b3001e',
    helmetColor: '#d50000',
    sponsor: 'GASGAS',
    stats: {
      speed: 96,
      acceleration: 97,
      handling: 95,
      braking: 96
    },
    topSpeedKmh: 354,
    accelFactor: 1.05,
    handlingFactor: 1.02,
    brakingFactor: 1.03
  }
];

export const TRACK_DEFINITIONS = [
  {
    id: 'lemans',
    name: 'Circuit Bugatti Le Mans',
    location: 'France 🇫🇷',
    lengthKm: 4.185,
    turns: 14,
    recordLap: '1:30.450',
    recordHolder: 'F. Bagnaia',
    difficulty: 'Technique',
    description: 'Chicanes mythiques, gros freinages et courbe Dunlop légendaire.',
    roadWidth: 14,
    scale: 3.2,
    ambientColor: 0x445566,
    skyColor: 0x7eb0ea,
    groundColor: 0x2d4a27,
    points: [
      // Start straight
      [0, 0, 0],
      [120, 0, 0],
      [240, 0, 0],
      [360, 0, 0],
      // Dunlop Curve right kink
      [460, 2, 20],
      [540, 5, 60],
      // Dunlop Chicane (T2 left, T3 right)
      [580, 6, 110],
      [570, 7, 160],
      [610, 6, 210],
      // La Chapelle descent (T4)
      [650, 4, 270],
      [640, 1, 330],
      [590, -1, 380],
      // Le Musée (T5 hairpin left)
      [520, -2, 400],
      [460, -2, 380],
      [420, -1, 330],
      // Straight towards Garage Vert
      [370, 0, 280],
      [310, 1, 240],
      // Garage Vert double right (T6-T7)
      [240, 1, 230],
      [190, 0, 260],
      [160, 0, 310],
      [180, 0, 380],
      // Straight towards Chemin aux Boeufs
      [210, 0, 470],
      [240, 0, 560],
      // Chemin aux Boeufs chicane (T8-T9)
      [240, 0, 630],
      [220, 0, 680],
      [250, 0, 730],
      // Towards S Bleus
      [260, 1, 800],
      [240, 2, 870],
      // S Bleus (T10-T11)
      [180, 2, 920],
      [120, 1, 910],
      [70, 0, 850],
      // Towards Raccordement
      [30, 0, 760],
      [-10, 0, 650],
      [-40, 0, 520],
      [-70, 0, 390],
      [-90, 0, 260],
      // Raccordement double right (T12-T13-T14)
      [-100, 0, 150],
      [-110, 0, 80],
      [-80, 0, 30],
      [-40, 0, 5]
    ]
  },
  {
    id: 'mugello',
    name: 'Autodromo del Mugello',
    location: 'Italie 🇮🇹',
    lengthKm: 5.245,
    turns: 15,
    recordLap: '1:44.855',
    recordHolder: 'J. Martín',
    difficulty: 'Rapide & Vallonné',
    description: 'Ligne droite de 1.1 km à 360 km/h, collines toscanes et mythiques Arrabbiata.',
    roadWidth: 15,
    scale: 3.5,
    ambientColor: 0x554433,
    skyColor: 0x82b8ff,
    groundColor: 0x3e5229,
    points: [
      // Monumental 1.14 km main straight
      [-400, 0, 0],
      [-250, 0, 0],
      [-100, 0, 0],
      [50, 0, 0],
      [200, 1, 0],
      [350, 2, 0],
      [500, 4, 0],
      // Turn 1 San Donato (heavy braking uphill right)
      [620, 8, 15],
      [700, 12, 50],
      [730, 15, 110],
      [700, 17, 180],
      // Luco & Poggio Secco (T2-T3)
      [630, 18, 240],
      [550, 17, 280],
      [480, 15, 330],
      [470, 14, 400],
      [510, 13, 460],
      // Materassi & Borgo San Lorenzo (T4-T5)
      [560, 12, 530],
      [540, 11, 590],
      [470, 10, 630],
      // Casanova & Savelli rollercoaster downhill (T6-T7)
      [380, 8, 640],
      [300, 4, 610],
      [230, 0, 570],
      [160, -4, 530],
      // Arrabbiata 1 & Arrabbiata 2 (T8-T9) epic uphill sweeping right
      [100, -5, 480],
      [40, -2, 450],
      [-30, 3, 440],
      [-100, 9, 460],
      [-170, 16, 510],
      // Scarperia & Palagio (T10-T11)
      [-230, 18, 570],
      [-280, 17, 630],
      [-340, 15, 620],
      [-390, 13, 570],
      // Correntaio downhill hairpin (T12)
      [-420, 10, 490],
      [-410, 7, 420],
      [-360, 5, 360],
      // Biondetti 1 & 2 chicane (T13-T14)
      [-320, 4, 290],
      [-300, 3, 230],
      [-330, 2, 170],
      // Bucine long final sweeping left (T15) leading onto main straight
      [-380, 1, 110],
      [-430, 0, 60],
      [-450, 0, 20]
    ]
  },
  {
    id: 'valencia',
    name: 'Circuit Ricardo Tormo Valencia',
    location: 'Espagne 🇪🇸',
    lengthKm: 4.005,
    turns: 14,
    recordLap: '1:29.401',
    recordHolder: 'M. Márquez',
    difficulty: 'Arène Stadium',
    description: 'Circuit en arène avec virages serrés, tribune circulaire et public en folie.',
    roadWidth: 13.5,
    scale: 3.3,
    ambientColor: 0x554422,
    skyColor: 0x88bbff,
    groundColor: 0x5a482b,
    points: [
      // Straight
      [0, 0, 0],
      [150, 0, 0],
      [300, 0, 0],
      [450, 0, 0],
      // Turn 1 Aspar (fast left)
      [550, 0, 30],
      [610, 0, 90],
      [620, 0, 160],
      // Turn 2 Doohan (tight left)
      [580, 0, 220],
      [510, 0, 260],
      [430, 0, 270],
      // Turns 3-4-5 chicane
      [350, 0, 250],
      [280, 0, 220],
      [220, 0, 260],
      [190, 0, 330],
      // Turns 6-7 loop
      [190, 0, 410],
      [240, 0, 470],
      [310, 0, 490],
      [390, 0, 480],
      // Bernat Martinez & Nieto
      [450, 0, 440],
      [490, 0, 380],
      [520, 0, 330],
      [560, 0, 360],
      [570, 0, 430],
      [540, 0, 510],
      // Stadium infield
      [470, 0, 570],
      [380, 0, 600],
      [270, 0, 600],
      [160, 0, 580],
      // Curva Champi Herreros
      [80, 0, 530],
      [20, 0, 460],
      [-30, 0, 380],
      // Final sweeping left Adrian Campos onto main straight
      [-70, 0, 280],
      [-90, 0, 180],
      [-90, 0, 90],
      [-60, 0, 30]
    ]
  }
];

export const WEATHER_PRESETS = {
  sunny: {
    id: 'sunny',
    name: 'Ensoleillé',
    sunColor: 0xfffaed,
    sunIntensity: 1.8,
    ambientColor: 0x667788,
    fogColor: 0x9ac4f8,
    fogDensity: 0.0006,
    gripMultiplier: 1.0,
    rain: false,
    skyGradient: ['#3b88e0', '#88c3f8', '#c6e3ff']
  },
  sunset: {
    id: 'sunset',
    name: 'Coucher de Soleil',
    sunColor: 0xff7722,
    sunIntensity: 2.2,
    ambientColor: 0x553344,
    fogColor: 0xbb5533,
    fogDensity: 0.0008,
    gripMultiplier: 0.98,
    rain: false,
    skyGradient: ['#28114b', '#a73737', '#ff843a']
  },
  wet: {
    id: 'wet',
    name: 'Piste Mouillée (Wet Race)',
    sunColor: 0x8899aa,
    sunIntensity: 0.9,
    ambientColor: 0x445566,
    fogColor: 0x667788,
    fogDensity: 0.002,
    gripMultiplier: 0.82,
    rain: true,
    skyGradient: ['#33414d', '#556575', '#7a8a99']
  }
};

export const PHYSICS_CONFIG = {
  mass: 220, // kg (bike 157kg + rider 63kg)
  enginePowerHP: 290, // MotoGP 1000cc prototype
  maxRpm: 18000,
  idleRpm: 3500,
  gearRatios: [
    { gear: 1, maxKmh: 135, accel: 14.5 },
    { gear: 2, maxKmh: 190, accel: 11.2 },
    { gear: 3, maxKmh: 240, accel: 8.8 },
    { gear: 4, maxKmh: 285, accel: 6.5 },
    { gear: 5, maxKmh: 325, accel: 4.8 },
    { gear: 6, maxKmh: 362, accel: 3.2 }
  ],
  maxBrakingDecel: 18.5, // m/s^2 (~1.9G under carbon brakes)
  rearBrakeDecel: 6.0,
  maxLeanAngleDeg: 64.0, // Modern MotoGP maximum lean
  leanSpeedDegPerSec: 120.0, // Roll rate (transition left-to-right)
  offTrackGrip: 0.35, // When running into gravel traps
  curbGrip: 0.90,
  slipstreamRange: 24.0, // meters behind bike
  slipstreamBonus: 1.18, // +18% acceleration
  nitroBonusKmh: 25.0,
  nitroDurationSec: 5.0,
  nitroRechargeRate: 0.12 // per second
};

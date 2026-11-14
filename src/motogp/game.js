// Gestionnaire principal de partie MotoGP 3D (Machine d'état, boucle de jeu et événements)
import * as THREE from 'three';
import { TEAMS, TRACK_DEFINITIONS, WEATHER_PRESETS } from './constants.js';
import { Circuit } from './track.js';
import { createMotoGPBike } from './models.js';
import { BikePhysics } from './physics.js';
import { AIRider } from './ai.js';
import { CameraManager } from './camera.js';
import { MotoGP_HUD } from './hud.js';
import { AudioEngine } from './audio.js';

export class MotoGPGame {
  constructor(canvasContainer, uiContainer) {
    this.canvasContainer = canvasContainer;
    this.uiContainer = uiContainer;

    this.state = 'MENU'; // 'MENU' | 'COUNTDOWN' | 'RACING' | 'PAUSED' | 'FINISHED'
    this.gameMode = 'grandprix'; // 'grandprix' | 'timeattack' | 'championship' | 'practice'
    this.selectedTrackId = 'lemans';
    this.selectedTeamId = 'ducati';
    this.selectedWeatherId = 'sunny';
    this.aiDifficulty = 'pro';
    this.totalLaps = 3;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.circuit = null;
    this.cameraManager = null;
    this.audio = new AudioEngine();

    // Entities
    this.playerPhysics = null;
    this.playerModel = null;
    this.aiRiders = [];
    this.allRiders = [];

    // Inputs
    this.keys = {};
    this.touchInputs = { throttle: 0, brake: 0, steer: 0, rearBrake: 0, nitro: false };
    this.gamepadIndex = null;

    // Countdown state
    this.countdownTimer = 0;
    this.countdownStep = 0;
    this.raceStartTime = 0;

    // HUD
    this.hud = null;
    this.clock = new THREE.Clock();

    this.initRenderer();
    this.initInputListeners();
  }

  initRenderer() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(64, window.innerWidth / window.innerHeight, 0.2, 3500);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.canvasContainer.appendChild(this.renderer.domElement);

    this.cameraManager = new CameraManager(this.camera);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initInputListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      this.audio.init();
      this.audio.resume();

      if (e.code === 'KeyC' && this.state === 'RACING') {
        const name = this.cameraManager.nextMode();
        if (this.hud) this.hud.showAlert(`Caméra : ${name}`, 1500);
      }
      if (e.code === 'KeyR' && this.state === 'RACING') {
        this.resetPlayerToTrack();
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        this.togglePause();
      }
      if (e.code === 'KeyM') {
        const muted = this.audio.toggleMute();
        if (this.hud) this.hud.showAlert(muted ? 'Son : Coupé' : 'Son : Activé', 1200);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Gamepad API
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepadIndex = e.gamepad.index;
      if (this.hud) this.hud.showAlert('Manette connectée !', 2000);
    });

    window.addEventListener('gamepaddisconnected', () => {
      this.gamepadIndex = null;
    });
  }

  setupMobileControls() {
    const btnGas = document.getElementById('mob-gas');
    const btnBrake = document.getElementById('mob-brake');
    const btnLeft = document.getElementById('mob-left');
    const btnRight = document.getElementById('mob-right');
    const btnNitro = document.getElementById('mob-nitro');

    const bindTouch = (el, onStart, onEnd) => {
      if (!el) return;
      el.addEventListener('touchstart', (e) => { e.preventDefault(); this.audio.init(); onStart(); }, { passive: false });
      el.addEventListener('touchend', (e) => { e.preventDefault(); onEnd(); }, { passive: false });
      el.addEventListener('mousedown', () => { this.audio.init(); onStart(); });
      el.addEventListener('mouseup', () => { onEnd(); });
      el.addEventListener('mouseleave', () => { onEnd(); });
    };

    bindTouch(btnGas, () => { this.touchInputs.throttle = 1; }, () => { this.touchInputs.throttle = 0; });
    bindTouch(btnBrake, () => { this.touchInputs.brake = 1; }, () => { this.touchInputs.brake = 0; });
    bindTouch(btnLeft, () => { this.touchInputs.steer = -1; }, () => { this.touchInputs.steer = 0; });
    bindTouch(btnRight, () => { this.touchInputs.steer = 1; }, () => { this.touchInputs.steer = 0; });
    bindTouch(btnNitro, () => { this.touchInputs.nitro = true; }, () => { this.touchInputs.nitro = false; });
  }

  startRace(config = {}) {
    this.gameMode = config.mode || this.gameMode;
    this.selectedTrackId = config.trackId || this.selectedTrackId;
    this.selectedTeamId = config.teamId || this.selectedTeamId;
    this.selectedWeatherId = config.weatherId || this.selectedWeatherId;
    this.aiDifficulty = config.difficulty || this.aiDifficulty;
    this.totalLaps = config.laps || 3;

    // Reset scene
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    const trackDef = TRACK_DEFINITIONS.find(t => t.id === this.selectedTrackId) || TRACK_DEFINITIONS[0];
    const weatherDef = WEATHER_PRESETS[this.selectedWeatherId] || WEATHER_PRESETS.sunny;
    const playerTeam = TEAMS.find(t => t.id === this.selectedTeamId) || TEAMS[0];

    // 1. Setup Lighting & Atmosphere
    this.setupAtmosphere(trackDef, weatherDef);

    // 2. Build 3D Circuit
    this.circuit = new Circuit(trackDef, weatherDef);
    this.scene.add(this.circuit.group);

    // 3. Player Bike & Physics
    this.playerPhysics = new BikePhysics(playerTeam, this.circuit, true);
    this.playerModel = createMotoGPBike(playerTeam, true);
    this.scene.add(this.playerModel.root);

    // Place Player in Pole Position (Slot 0)
    const poleU = 0;
    this.playerPhysics.resetToTrack(poleU, 2.5);
    this.playerModel.root.position.copy(this.playerPhysics.pos);
    this.playerModel.root.rotation.y = this.playerPhysics.yaw;

    // 4. Setup AI Competitors
    this.aiRiders = [];
    const oppTeams = TEAMS.filter(t => t.id !== playerTeam.id);
    const numAi = this.gameMode === 'timeattack' ? 0 : 7;

    for (let i = 0; i < numAi; i++) {
      const oppTeam = oppTeams[i % oppTeams.length];
      const ai = new AIRider(oppTeam, this.circuit, this.aiDifficulty);
      ai.setGridPosition(i + 1); // Grid slot 1, 2, 3...
      this.scene.add(ai.model.root);
      this.aiRiders.push(ai);
    }

    this.allRiders = [
      { isPlayer: true, team: playerTeam, physics: this.playerPhysics, model: this.playerModel },
      ...this.aiRiders.map(ai => ({ isPlayer: false, team: ai.team, physics: ai.physics, model: ai.model }))
    ];

    // 5. Initialize HUD
    const hudContainer = document.getElementById('hud-layer');
    this.hud = new MotoGP_HUD(hudContainer, this.circuit);
    this.setupMobileControls();

    // 6. Start 5-Red-Lights Countdown
    this.state = 'COUNTDOWN';
    this.countdownTimer = 0;
    this.countdownStep = 0;
    this.circuit.setStartLightsCount(0);

    if (this.hud) {
      this.hud.showAlert('DÉPART IMMINENT...', 2000);
    }

    this.clock.start();
  }

  setupAtmosphere(trackDef, weather) {
    // Sky color & Fog
    this.scene.background = new THREE.Color(weather.fogColor);
    this.scene.fog = new THREE.FogExp2(weather.fogColor, weather.fogDensity);

    // Hemisphere light (sky vs ground)
    const hemiLight = new THREE.HemisphereLight(weather.skyGradient[0], trackDef.groundColor, 0.9);
    this.scene.add(hemiLight);

    // Main Sun Directional Light
    const sunLight = new THREE.DirectionalLight(weather.sunColor, weather.sunIntensity);
    sunLight.position.set(300, 450, 200);
    this.scene.add(sunLight);

    // Ambient light
    const ambLight = new THREE.AmbientLight(weather.ambientColor, 0.75);
    this.scene.add(ambLight);
  }

  getPlayerInputs() {
    let throttle = 0;
    let brake = 0;
    let steer = 0;
    let rearBrake = 0;
    let nitro = false;

    // Keyboard (ZQSD / WASD / Arrows)
    if (this.keys['KeyW'] || this.keys['KeyZ'] || this.keys['ArrowUp']) throttle = 1.0;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) brake = 1.0;
    if (this.keys['KeyA'] || this.keys['KeyQ'] || this.keys['ArrowLeft']) steer -= 1.0;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) steer += 1.0;
    if (this.keys['Space']) rearBrake = 1.0;
    if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) nitro = true;

    // Touch inputs
    throttle = Math.max(throttle, this.touchInputs.throttle);
    brake = Math.max(brake, this.touchInputs.brake);
    steer += this.touchInputs.steer;
    nitro = nitro || this.touchInputs.nitro;

    // Gamepad API
    if (this.gamepadIndex !== null) {
      const gp = navigator.getGamepads()[this.gamepadIndex];
      if (gp) {
        // Triggers: RT (accelerator), LT (brake)
        if (gp.buttons[7]) throttle = Math.max(throttle, gp.buttons[7].value);
        if (gp.buttons[6]) brake = Math.max(brake, gp.buttons[6].value);
        // Left Stick (steering)
        if (Math.abs(gp.axes[0]) > 0.12) steer += gp.axes[0];
        // Button A / Cross: Nitro
        if (gp.buttons[0] && gp.buttons[0].pressed) nitro = true;
        // Button B / Circle: Rear Brake
        if (gp.buttons[1] && gp.buttons[1].pressed) rearBrake = 1.0;
      }
    }

    return { throttle, brake, steer, rearBrake, nitro };
  }

  updateCountdown(dt) {
    this.countdownTimer += dt;

    // Sequential 5 red lights: 1 light per 0.9s
    if (this.countdownStep < 5 && this.countdownTimer >= (this.countdownStep + 1) * 0.9) {
      this.countdownStep++;
      this.circuit.setStartLightsCount(this.countdownStep);
      this.audio.playStartBeep(false);
    }

    // After all 5 red lights are on, random pause between 1.2s and 2.4s, then LIGHTS OUT!
    if (this.countdownStep === 5 && this.countdownTimer >= 4.5 + 1.6) {
      this.circuit.setStartLightsCount(0); // All 5 lights turn off!
      this.audio.playStartBeep(true);
      this.state = 'RACING';
      this.raceStartTime = performance.now();
      if (this.hud) {
        this.hud.showAlert('DÉPART ! LIGHTS OUT & AWAY WE GO !', 2000);
      }
    }
  }

  update(dt) {
    if (this.state === 'PAUSED' || !this.circuit) return;

    if (this.state === 'COUNTDOWN') {
      this.updateCountdown(dt);
      // In countdown, keep engine revving at idle / player throttle
      const inputs = this.getPlayerInputs();
      this.playerPhysics.rpm = PHYSICS_CONFIG.idleRpm + inputs.throttle * 8000;
      this.audio.updatePlayer(this.playerPhysics.rpm, 1, inputs.throttle, 0, false, false, 0);
    }
    else if (this.state === 'RACING' || this.state === 'FINISHED') {
      const inputs = this.state === 'FINISHED' ? { throttle: 0.3, brake: 0, steer: 0 } : this.getPlayerInputs();

      // 1. Update Player Physics
      const opponentPhys = this.aiRiders.map(ai => ai.physics);
      this.playerPhysics.update(dt, inputs, opponentPhys);

      // 2. Update Player 3D Model
      this.playerModel.root.position.copy(this.playerPhysics.pos);
      this.playerModel.root.rotation.y = this.playerPhysics.yaw;
      this.playerModel.update(
        this.playerPhysics.leanAngle,
        this.playerPhysics.steerAngle,
        this.playerPhysics.speedKmh,
        inputs.throttle,
        inputs.brake,
        this.playerPhysics.sparking
      );

      // 3. Update AI Riders
      for (const ai of this.aiRiders) {
        ai.update(dt, this.allRiders);
      }

      // 4. Update Audio Engine
      const telem = this.playerPhysics.getTelemetry();
      this.audio.updatePlayer(
        telem.rpm,
        telem.gear,
        inputs.throttle,
        telem.speedKmh,
        telem.surface === 'curb',
        telem.surface === 'gravel',
        this.playerPhysics.tireSlide
      );

      // 5. Update Rain system if wet
      if (this.circuit.weather.rain) {
        this.circuit.updateRain(this.playerPhysics.pos);
      }

      // 6. Check Lap & Finish Condition
      if (this.playerPhysics.lap > this.totalLaps && this.state !== 'FINISHED') {
        this.state = 'FINISHED';
        this.audio.playCheckeredFlag();
        if (this.hud) {
          this.hud.showAlert('🏁 DRAPEAU À DAMIER ! VICTOIRE !', 5000);
        }
        setTimeout(() => {
          this.showResultsScreen();
        }, 3500);
      }

      // Check final lap alert
      if (this.playerPhysics.lap === this.totalLaps && !this.finalLapAlertShown) {
        this.finalLapAlertShown = true;
        if (this.hud) this.hud.showAlert('DERNIER TOUR ! PUSH TO THE LIMIT !', 2500);
      }

      // 7. Update HUD
      if (this.hud) {
        this.hud.update(telem, this.allRiders, this.totalLaps, this.cameraManager.getModeName());
      }
    }

    // Update Camera
    this.cameraManager.update(dt, this.playerPhysics);

    // Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }

  resetPlayerToTrack() {
    if (!this.playerPhysics || !this.circuit) return;
    const u = this.playerPhysics.trackDistance;
    this.playerPhysics.resetToTrack(u, 0);
    this.playerModel.root.position.copy(this.playerPhysics.pos);
    this.playerModel.root.rotation.y = this.playerPhysics.yaw;
    if (this.hud) this.hud.showAlert('Moto replacée sur la piste', 1500);
  }

  togglePause() {
    if (this.state === 'RACING') {
      this.state = 'PAUSED';
      document.getElementById('pause-modal').style.display = 'flex';
    } else if (this.state === 'PAUSED') {
      this.state = 'RACING';
      document.getElementById('pause-modal').style.display = 'none';
    }
  }

  showResultsScreen() {
    const resultsModal = document.getElementById('results-modal');
    if (!resultsModal) return;

    // Calculate final standings
    const sorted = [...this.allRiders].sort((a, b) => {
      const distA = (a.physics.lap * a.physics.circuit.totalLength) + a.physics.trackDistance;
      const distB = (b.physics.lap * b.physics.circuit.totalLength) + b.physics.trackDistance;
      return distB - distA;
    });

    const listEl = document.getElementById('results-list');
    if (listEl) {
      const pointsTable = [25, 20, 16, 13, 11, 10, 9, 8];
      let html = '';
      sorted.forEach((rider, idx) => {
        const pos = idx + 1;
        const pts = pointsTable[idx] || 0;
        const best = rider.physics.bestLapTime ? this.hud.formatTime(rider.physics.bestLapTime) : '--:--.---';
        html += `
          <div class="result-row ${rider.isPlayer ? 'player' : ''}">
            <span class="res-pos p${pos}">P${pos}</span>
            <span class="res-team-dot" style="background:${rider.team.color}"></span>
            <span class="res-num">#${rider.team.number}</span>
            <span class="res-name">${rider.team.rider}</span>
            <span class="res-best">Meilleur : ${best}</span>
            <span class="res-pts">+${pts} PTS</span>
          </div>
        `;
      });
      listEl.innerHTML = html;
    }

    resultsModal.style.display = 'flex';
  }
}

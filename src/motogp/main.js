// Point d'entrée de l'application MotoGP 3D
import { MotoGPGame } from './game.js';
import { TEAMS, TRACK_DEFINITIONS, WEATHER_PRESETS } from './constants.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvasContainer = document.getElementById('canvas-container');
  const uiContainer = document.getElementById('ui-container');

  const game = new MotoGPGame(canvasContainer, uiContainer);

  let selectedMode = 'grandprix';
  let selectedTrackId = 'lemans';
  let selectedTeamId = 'ducati';
  let selectedWeatherId = 'sunny';
  let selectedDifficulty = 'pro';
  let selectedLaps = 3;

  // Initialize Menu DOM
  initMenuUI();

  function initMenuUI() {
    // 1. Populate Tracks
    const tracksContainer = document.getElementById('menu-tracks-list');
    if (tracksContainer) {
      tracksContainer.innerHTML = TRACK_DEFINITIONS.map((t, idx) => `
        <div class="track-card ${t.id === selectedTrackId ? 'active' : ''}" data-track="${t.id}">
          <div class="track-header">
            <span class="track-loc">${t.location}</span>
            <span class="track-turns">${t.turns} virages</span>
          </div>
          <h3 class="track-name">${t.name}</h3>
          <div class="track-meta">
            <span>Longueur : ${t.lengthKm} km</span>
            <span>Record : ${t.recordLap}</span>
          </div>
          <p class="track-desc">${t.description}</p>
        </div>
      `).join('');

      tracksContainer.querySelectorAll('.track-card').forEach(card => {
        card.addEventListener('click', () => {
          tracksContainer.querySelectorAll('.track-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          selectedTrackId = card.dataset.track;
          game.audio.playButtonClick();
        });
      });
    }

    // 2. Populate Teams & Riders
    const ridersContainer = document.getElementById('menu-riders-list');
    if (ridersContainer) {
      ridersContainer.innerHTML = TEAMS.map(team => `
        <div class="rider-card ${team.id === selectedTeamId ? 'active' : ''}" data-team="${team.id}">
          <div class="rider-stripe" style="background:${team.color}"></div>
          <div class="rider-content">
            <div class="rider-header">
              <span class="rider-num" style="color:${team.numberColor}; background:${team.color}">#${team.number}</span>
              <span class="rider-nat">${team.country}</span>
            </div>
            <h4 class="rider-pilot">${team.rider}</h4>
            <div class="rider-team">${team.name}</div>
            <div class="rider-stats">
              <div class="stat-row">
                <span>Vitesse max</span>
                <div class="stat-bar"><div class="stat-fill" style="width:${team.stats.speed}%; background:${team.color}"></div></div>
              </div>
              <div class="stat-row">
                <span>Accélération</span>
                <div class="stat-bar"><div class="stat-fill" style="width:${team.stats.acceleration}%; background:${team.color}"></div></div>
              </div>
              <div class="stat-row">
                <span>Maniabilité</span>
                <div class="stat-bar"><div class="stat-fill" style="width:${team.stats.handling}%; background:${team.color}"></div></div>
              </div>
              <div class="stat-row">
                <span>Freinage</span>
                <div class="stat-bar"><div class="stat-fill" style="width:${team.stats.braking}%; background:${team.color}"></div></div>
              </div>
            </div>
          </div>
        </div>
      `).join('');

      ridersContainer.querySelectorAll('.rider-card').forEach(card => {
        card.addEventListener('click', () => {
          ridersContainer.querySelectorAll('.rider-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          selectedTeamId = card.dataset.team;
          game.audio.playButtonClick();
        });
      });
    }

    // 3. Weather presets selection
    const weatherButtons = document.querySelectorAll('[data-weather]');
    weatherButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        weatherButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedWeatherId = btn.dataset.weather;
        game.audio.playButtonClick();
      });
    });

    // 4. Difficulty selection
    const diffButtons = document.querySelectorAll('[data-diff]');
    diffButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDifficulty = btn.dataset.diff;
        game.audio.playButtonClick();
      });
    });

    // 5. Laps selection
    const lapsButtons = document.querySelectorAll('[data-laps]');
    lapsButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        lapsButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedLaps = parseInt(btn.dataset.laps, 10);
        game.audio.playButtonClick();
      });
    });

    // 6. Mode selection (Tabs)
    const modeTabs = document.querySelectorAll('[data-mode]');
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        modeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        selectedMode = tab.dataset.mode;
        game.audio.playButtonClick();
      });
    });

    // 7. Start Race Button
    const btnLaunch = document.getElementById('btn-launch-race');
    if (btnLaunch) {
      btnLaunch.addEventListener('click', () => {
        game.audio.init();
        game.audio.resume();
        game.audio.playButtonClick();

        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('hud-layer').style.display = 'block';

        game.startRace({
          mode: selectedMode,
          trackId: selectedTrackId,
          teamId: selectedTeamId,
          weatherId: selectedWeatherId,
          difficulty: selectedDifficulty,
          laps: selectedLaps
        });
      });
    }

    // Pause Modal Buttons
    const btnResume = document.getElementById('btn-resume');
    if (btnResume) {
      btnResume.addEventListener('click', () => {
        game.togglePause();
      });
    }

    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        document.getElementById('pause-modal').style.display = 'none';
        game.startRace({
          mode: selectedMode,
          trackId: selectedTrackId,
          teamId: selectedTeamId,
          weatherId: selectedWeatherId,
          difficulty: selectedDifficulty,
          laps: selectedLaps
        });
      });
    }

    const btnQuitMenu = document.getElementById('btn-quit-menu');
    if (btnQuitMenu) {
      btnQuitMenu.addEventListener('click', () => {
        document.getElementById('pause-modal').style.display = 'none';
        document.getElementById('hud-layer').style.display = 'none';
        document.getElementById('main-menu').style.display = 'flex';
        game.state = 'MENU';
      });
    }

    // Results Modal Buttons
    const btnReplayRace = document.getElementById('btn-replay-race');
    if (btnReplayRace) {
      btnReplayRace.addEventListener('click', () => {
        document.getElementById('results-modal').style.display = 'none';
        game.startRace({
          mode: selectedMode,
          trackId: selectedTrackId,
          teamId: selectedTeamId,
          weatherId: selectedWeatherId,
          difficulty: selectedDifficulty,
          laps: selectedLaps
        });
      });
    }

    const btnResultsMenu = document.getElementById('btn-results-menu');
    if (btnResultsMenu) {
      btnResultsMenu.addEventListener('click', () => {
        document.getElementById('results-modal').style.display = 'none';
        document.getElementById('hud-layer').style.display = 'none';
        document.getElementById('main-menu').style.display = 'flex';
        game.state = 'MENU';
      });
    }
  }

  // Main animation render loop
  let lastTime = performance.now();
  function loop(currentTime) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
    lastTime = currentTime;

    game.update(dt);
  }

  requestAnimationFrame(loop);
});

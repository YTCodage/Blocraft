// Affichage tête haute (HUD) officiel MotoGP, télémétrie en temps réel et minimap 2D

export class MotoGP_HUD {
  constructor(container, circuit) {
    this.container = container;
    this.circuit = circuit;
    this.minimapCanvas = null;
    this.minimapCtx = null;
    this.cachedTrackPoints = [];

    this.initDOM();
    this.cacheMinimapPoints();
  }

  initDOM() {
    this.container.innerHTML = `
      <!-- TOP BAR: LAP & TIMING -->
      <div id="hud-top">
        <div class="hud-box" id="hud-lap-box">
          <div class="hud-label">TOUR</div>
          <div class="hud-val" id="hud-lap">1 / 3</div>
        </div>
        <div class="hud-box" id="hud-time-box">
          <div class="hud-label">TEMPS AU TOUR</div>
          <div class="hud-val highlight" id="hud-current-time">0:00.000</div>
          <div class="hud-sub" id="hud-best-time">MEILLEUR : --:--.---</div>
        </div>
        <div class="hud-sectors">
          <span class="sector-dot" id="sec-1">S1</span>
          <span class="sector-dot" id="sec-2">S2</span>
          <span class="sector-dot" id="sec-3">S3</span>
        </div>
      </div>

      <!-- LEFT: TIMING TOWER / LEADERBOARD -->
      <div id="hud-timing-tower">
        <div class="tower-header">MOTOGP™ CLASSEMENT</div>
        <div id="tower-riders"></div>
      </div>

      <!-- CENTER POPUP ALERTS -->
      <div id="hud-alert-container">
        <div id="hud-alert" class="hud-alert-msg"></div>
      </div>

      <!-- BOTTOM RIGHT: SPEEDOMETER & TELEMETRY -->
      <div id="hud-dashboard">
        <div class="dash-rpm-bar">
          <div class="dash-rpm-fill" id="rpm-fill"></div>
          <div class="shift-lights" id="shift-lights">
            <span class="sl sl-g"></span><span class="sl sl-g"></span>
            <span class="sl sl-y"></span><span class="sl sl-y"></span>
            <span class="sl sl-r"></span><span class="sl sl-r"></span>
            <span class="sl sl-p"></span><span class="sl sl-p"></span>
          </div>
        </div>
        <div class="dash-main">
          <div class="dash-gear" id="dash-gear">1</div>
          <div class="dash-speed-group">
            <div class="dash-speed" id="dash-speed">0</div>
            <div class="dash-unit">KM/H</div>
          </div>
        </div>
        <div class="dash-telemetry">
          <div class="telem-item">
            <span>INCLINAISON</span>
            <strong id="telem-lean">0°</strong>
          </div>
          <div class="telem-item">
            <span>KERS / BOOST</span>
            <div class="nitro-gauge"><div id="nitro-fill"></div></div>
          </div>
        </div>
      </div>

      <!-- BOTTOM LEFT: MINIMAP & CAMERA -->
      <div id="hud-bottom-left">
        <canvas id="minimap-canvas" width="160" height="160"></canvas>
        <div id="camera-badge">VUE : POURSUITE (C)</div>
      </div>

      <!-- MOBILE CONTROLS OVERLAY -->
      <div id="mobile-controls" style="display: none;">
        <div class="mob-group mob-steer">
          <button type="button" class="mob-btn" id="mob-left" aria-label="Gauche">◀</button>
          <button type="button" class="mob-btn" id="mob-right" aria-label="Droite">▶</button>
        </div>
        <div class="mob-group mob-actions">
          <button type="button" class="mob-btn mob-nitro" id="mob-nitro">⚡ BOOST</button>
          <button type="button" class="mob-btn mob-brake" id="mob-brake">FREIN</button>
          <button type="button" class="mob-btn mob-gas" id="mob-gas">GAZ</button>
        </div>
      </div>
    `;

    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');

    // Detect mobile touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      const mob = document.getElementById('mobile-controls');
      if (mob) mob.style.display = 'flex';
    }
  }

  cacheMinimapPoints() {
    this.cachedTrackPoints = [];
    const samples = this.circuit.samples;
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i < samples.length; i += 2) {
      const p = samples[i].point;
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minZ = Math.min(minZ, p.z);
      maxZ = Math.max(maxZ, p.z);
    }

    const rangeX = maxX - minX || 1;
    const rangeZ = maxZ - minZ || 1;
    const maxRange = Math.max(rangeX, rangeZ);
    const padding = 16;
    const size = 160 - padding * 2;

    for (let i = 0; i < samples.length; i += 2) {
      const p = samples[i].point;
      const nx = padding + ((p.x - minX) / maxRange) * size;
      const nz = padding + ((p.z - minZ) / maxRange) * size;
      this.cachedTrackPoints.push({ x: nx, y: nz });
    }

    this.minRange = { minX, minZ, maxRange, padding, size };
  }

  update(telemetry, ridersList = [], maxLaps = 3, cameraName = '') {
    // 1. Dash speed & gear
    const speedEl = document.getElementById('dash-speed');
    const gearEl = document.getElementById('dash-gear');
    if (speedEl) speedEl.textContent = telemetry.speedKmh;
    if (gearEl) gearEl.textContent = telemetry.gear;

    // 2. RPM Bar & Shift lights
    const rpmFill = document.getElementById('rpm-fill');
    if (rpmFill) {
      const pct = Math.max(0, Math.min(100, ((telemetry.rpm - 3500) / (18000 - 3500)) * 100));
      rpmFill.style.width = `${pct}%`;
    }

    const shiftLights = document.getElementById('shift-lights');
    if (shiftLights) {
      if (telemetry.rpm > 17000) {
        shiftLights.classList.add('flash-purple');
      } else {
        shiftLights.classList.remove('flash-purple');
      }
    }

    // 3. Lean angle & Nitro
    const leanEl = document.getElementById('telem-lean');
    if (leanEl) {
      const deg = telemetry.leanAngleDeg;
      const dir = deg < -2 ? 'G' : (deg > 2 ? 'D' : '');
      leanEl.textContent = `${Math.abs(deg)}° ${dir}`;
      if (telemetry.sparking) {
        leanEl.style.color = '#ff9800';
      } else {
        leanEl.style.color = '#ffffff';
      }
    }

    const nitroFill = document.getElementById('nitro-fill');
    if (nitroFill) {
      nitroFill.style.width = `${Math.round(telemetry.nitro * 100)}%`;
      if (telemetry.isNitroActive) {
        nitroFill.classList.add('active');
      } else {
        nitroFill.classList.remove('active');
      }
    }

    // 4. Laps & Times
    const lapEl = document.getElementById('hud-lap');
    if (lapEl) lapEl.textContent = `${Math.min(maxLaps, telemetry.lap)} / ${maxLaps}`;

    const curTimeEl = document.getElementById('hud-current-time');
    if (curTimeEl) curTimeEl.textContent = this.formatTime(telemetry.currentLapTime);

    const bestTimeEl = document.getElementById('hud-best-time');
    if (bestTimeEl && telemetry.bestLapTime) {
      bestTimeEl.textContent = `MEILLEUR : ${this.formatTime(telemetry.bestLapTime)}`;
    }

    // 5. Camera Badge
    if (cameraName) {
      const camBadge = document.getElementById('camera-badge');
      if (camBadge) camBadge.textContent = `${cameraName} (C)`;
    }

    // 6. Timing Tower
    this.updateTimingTower(ridersList);

    // 7. Minimap
    this.drawMinimap(ridersList);
  }

  updateTimingTower(ridersList) {
    const container = document.getElementById('tower-riders');
    if (!container || !ridersList.length) return;

    // Sort riders by lap and track progress
    const sorted = [...ridersList].sort((a, b) => {
      const distA = (a.physics.lap * a.physics.circuit.totalLength) + a.physics.trackDistance;
      const distB = (b.physics.lap * b.physics.circuit.totalLength) + b.physics.trackDistance;
      return distB - distA;
    });

    let html = '';
    sorted.slice(0, 8).forEach((rider, idx) => {
      const isPlayer = rider.isPlayer;
      const team = rider.team;
      const pos = idx + 1;
      const gap = idx === 0 ? 'LEADER' : `+${(idx * 0.42).toFixed(3)}s`;

      html += `
        <div class="tower-row ${isPlayer ? 'player' : ''}">
          <span class="pos-badge p${pos}">${pos}</span>
          <span class="team-stripe" style="background:${team.color}"></span>
          <span class="rider-num">${team.number}</span>
          <span class="rider-name">${team.rider.split(' ').pop().toUpperCase()}</span>
          <span class="gap">${gap}</span>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  drawMinimap(ridersList) {
    if (!this.minimapCtx || !this.cachedTrackPoints.length) return;
    const ctx = this.minimapCtx;
    ctx.clearRect(0, 0, 160, 160);

    // Draw track line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(this.cachedTrackPoints[0].x, this.cachedTrackPoints[0].y);
    for (let i = 1; i < this.cachedTrackPoints.length; i++) {
      ctx.lineTo(this.cachedTrackPoints[i].x, this.cachedTrackPoints[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    // Start/Finish tick mark
    const p0 = this.cachedTrackPoints[0];
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.arc(p0.x, p0.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw all riders
    const { minX, minZ, maxRange, padding, size } = this.minRange;
    for (const rider of ridersList) {
      const pos = rider.physics ? rider.physics.pos : rider.pos;
      const nx = padding + ((pos.x - minX) / maxRange) * size;
      const nz = padding + ((pos.z - minZ) / maxRange) * size;

      if (rider.isPlayer) {
        // Player icon: bright yellow / gold circle with stroke
        ctx.fillStyle = '#ffee00';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(nx, nz, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // AI icon: team color dot
        ctx.fillStyle = rider.team ? rider.team.color : '#ffffff';
        ctx.beginPath();
        ctx.arc(nx, nz, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  showAlert(text, durationMs = 2500) {
    const el = document.getElementById('hud-alert');
    if (!el) return;
    el.textContent = text;
    el.classList.add('visible');
    clearTimeout(this.alertTimer);
    this.alertTimer = setTimeout(() => {
      el.classList.remove('visible');
    }, durationMs);
  }

  formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00.000';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec * 1000) % 1000);
    return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }
}

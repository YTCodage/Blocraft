// Moteur Physique MotoGP - Dynamique 1000cc, inclinaison jusqu'à 64°, boîte de vitesses et trajectoire
import * as THREE from 'three';
import { PHYSICS_CONFIG } from './constants.js';

export class BikePhysics {
  constructor(team, circuit, isPlayer = false) {
    this.team = team;
    this.circuit = circuit;
    this.isPlayer = isPlayer;

    this.pos = new THREE.Vector3(0, 0, 0);
    this.yaw = 0;
    this.speedKmh = 0;
    this.leanAngle = 0; // rad (positive = lean right, negative = lean left)
    this.steerAngle = 0;
    this.pitchAngle = 0;

    this.gear = 1;
    this.rpm = PHYSICS_CONFIG.idleRpm;
    this.nitro = 1.0;
    this.isNitroActive = false;

    this.lap = 1;
    this.totalDistance = 0;
    this.trackDistance = 0;
    this.lapStartTime = 0;
    this.currentLapTime = 0;
    this.bestLapTime = null;
    this.lastLapTime = null;

    this.currentSector = 1;
    this.sectorPassed = [false, false, false]; // [S1, S2, S3]
    this.sectorTimes = [null, null, null];
    this.bestSectorTimes = [null, null, null];

    this.surface = 'tarmac';
    this.tireSlide = 0;
    this.isDrafting = false;
    this.sparking = false;
    this.offTrackTimer = 0;
    this.isFinished = false;

    // Tuning from team
    this.topSpeedKmh = team.topSpeedKmh || 355;
    this.accelFactor = team.accelFactor || 1.0;
    this.handlingFactor = team.handlingFactor || 1.0;
    this.brakingFactor = team.brakingFactor || 1.0;
  }

  resetToTrack(uDistance, lateralOffset = 0) {
    const u = (uDistance % this.circuit.totalLength) / this.circuit.totalLength;
    const pt = this.circuit.curve.getPointAt(u);
    const tangent = this.circuit.curve.getTangentAt(u).normalize();
    const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

    this.pos.copy(pt).addScaledVector(right, lateralOffset);
    this.pos.y = pt.y + 0.35;

    // Heading from tangent
    this.yaw = Math.atan2(-tangent.z, tangent.x) + Math.PI / 2;
    this.speedKmh = 0;
    this.leanAngle = 0;
    this.steerAngle = 0;
    this.gear = 1;
    this.rpm = PHYSICS_CONFIG.idleRpm;
    this.nitro = 1.0;
  }

  update(dt, inputs, opponents = []) {
    if (dt <= 0 || dt > 0.1) dt = 0.016; // Clamp dt

    const throttle = Math.max(0, Math.min(1, inputs.throttle || 0));
    const brake = Math.max(0, Math.min(1, inputs.brake || 0));
    const steer = Math.max(-1, Math.min(1, inputs.steer || 0));
    const rearBrake = Math.max(0, Math.min(1, inputs.rearBrake || 0));
    const nitroRequest = Boolean(inputs.nitro);

    // 1. NITRO / KERS BOOST
    if (nitroRequest && this.nitro > 0.05 && this.speedKmh > 30) {
      this.isNitroActive = true;
      this.nitro = Math.max(0, this.nitro - dt / PHYSICS_CONFIG.nitroDurationSec);
    } else {
      this.isNitroActive = false;
      // Recharges slowly, faster under braking (regenerative KERS)
      const chargeRate = PHYSICS_CONFIG.nitroRechargeRate * (1.0 + brake * 2.5);
      this.nitro = Math.min(1.0, this.nitro + dt * chargeRate * 0.08);
    }

    // 2. SLIPSTREAM / DRAFTING DETECTION
    this.isDrafting = false;
    const myFwd = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    for (const opp of opponents) {
      if (!opp || opp === this) continue;
      const toOpp = new THREE.Vector3().subVectors(opp.pos, this.pos);
      const distFwd = toOpp.dot(myFwd);
      if (distFwd > 3.0 && distFwd < PHYSICS_CONFIG.slipstreamRange) {
        const distSide = toOpp.clone().sub(myFwd.clone().multiplyScalar(distFwd)).length();
        if (distSide < 2.5) {
          this.isDrafting = true;
          break;
        }
      }
    }

    // 3. PROJECTION ONTO TRACK & SURFACE DETECTION
    const proj = this.circuit.projectPoint(this.pos);
    this.surface = proj.surface;
    this.trackDistance = proj.distOnTrack;

    let grip = 1.0;
    if (this.circuit.weather.rain) grip *= this.circuit.weather.gripMultiplier;

    if (this.surface === 'curb') {
      grip *= PHYSICS_CONFIG.curbGrip;
    } else if (this.surface === 'runoff') {
      grip *= 0.85;
    } else if (this.surface === 'gravel') {
      grip *= PHYSICS_CONFIG.offTrackGrip;
      this.offTrackTimer += dt;
    } else {
      this.offTrackTimer = Math.max(0, this.offTrackTimer - dt * 2);
    }

    // 4. GEARBOX & ENGINE RPM DYNAMICS
    const speedMps = this.speedKmh / 3.6;
    const currentRatio = PHYSICS_CONFIG.gearRatios[this.gear - 1];

    // Automatic gear shifting with quickshifter
    if (this.gear < 6 && this.speedKmh > currentRatio.maxKmh * 0.94) {
      this.gear++;
    } else if (this.gear > 1 && this.speedKmh < PHYSICS_CONFIG.gearRatios[this.gear - 2].maxKmh * 0.75) {
      this.gear--;
    }

    const gearRatio = PHYSICS_CONFIG.gearRatios[this.gear - 1];
    const targetRpm = Math.max(
      PHYSICS_CONFIG.idleRpm,
      Math.min(
        PHYSICS_CONFIG.maxRpm,
        PHYSICS_CONFIG.idleRpm + (this.speedKmh / gearRatio.maxKmh) * (PHYSICS_CONFIG.maxRpm - PHYSICS_CONFIG.idleRpm)
      )
    );
    this.rpm += (targetRpm - this.rpm) * 0.25;

    // 5. ACCELERATION & BRAKING FORCES
    let accelForce = 0;
    if (throttle > 0 && brake < 0.2) {
      const gearAccel = gearRatio.accel * this.accelFactor;
      accelForce = throttle * gearAccel;

      // Bonus nitro & slipstream
      if (this.isNitroActive) accelForce *= 1.35;
      if (this.isDrafting) accelForce *= PHYSICS_CONFIG.slipstreamBonus;

      // Reduced grip on gravel
      if (this.surface === 'gravel') accelForce *= 0.3;
    }

    // Aerodynamic Drag: F_drag = 0.5 * rho * CdA * v^2
    const maxSpeed = this.isNitroActive ? (this.topSpeedKmh + PHYSICS_CONFIG.nitroBonusKmh) : this.topSpeedKmh;
    const dragCoeff = (gearRatio.accel / (maxSpeed / 3.6)) * 0.65;
    const dragForce = dragCoeff * speedMps * (this.isDrafting ? 0.65 : 1.0);

    // Braking Force: Dual Carbon front brakes + rear brake
    let brakeForce = 0;
    if (brake > 0) {
      brakeForce += brake * PHYSICS_CONFIG.maxBrakingDecel * this.brakingFactor * grip;
    }
    if (rearBrake > 0) {
      brakeForce += rearBrake * PHYSICS_CONFIG.rearBrakeDecel * grip;
    }

    // Gravel trap resistance slows bike quickly
    let gravelResistance = 0;
    if (this.surface === 'gravel') {
      gravelResistance = 14.0 * grip;
    }

    // Forward net acceleration
    const netAccel = accelForce - dragForce - brakeForce - gravelResistance;
    let newSpeedMps = Math.max(0, speedMps + netAccel * dt);

    // Speed limiter on gravel
    if (this.surface === 'gravel' && newSpeedMps > (70 / 3.6)) {
      newSpeedMps = Math.max(70 / 3.6, newSpeedMps - 22 * dt);
    }

    this.speedKmh = newSpeedMps * 3.6;

    // 6. LEAN ANGLE & STEERING DYNAMICS
    // Lean sensitivity decreases naturally at extreme speeds (gyroscopic stability)
    const gyroStabilization = Math.max(0.55, 1.0 - (this.speedKmh / 420));
    const targetLean = -steer * (PHYSICS_CONFIG.maxLeanAngleDeg * Math.PI / 180) * this.handlingFactor * gyroStabilization;

    // Roll rate
    const rollSpeed = (PHYSICS_CONFIG.leanSpeedDegPerSec * Math.PI / 180) * this.handlingFactor;
    const leanDelta = targetLean - this.leanAngle;
    const maxStep = rollSpeed * dt;
    this.leanAngle += Math.max(-maxStep, Math.min(maxStep, leanDelta));

    // Clamp max lean
    const maxLeanRad = PHYSICS_CONFIG.maxLeanAngleDeg * Math.PI / 180;
    this.leanAngle = Math.max(-maxLeanRad, Math.min(maxLeanRad, this.leanAngle));

    this.steerAngle = -steer * 0.25;

    // Turning rate: yaw change based on lean angle and forward velocity
    // tan(lean) = v * w / g  =>  w = g * tan(lean) / v
    if (this.speedKmh > 5.0) {
      const g = 9.81;
      const turnRate = -(g * Math.tan(this.leanAngle) / Math.max(2.5, newSpeedMps)) * grip;
      this.yaw += turnRate * dt;
    } else if (steer !== 0 && this.speedKmh > 0.5) {
      this.yaw += -steer * 0.8 * dt;
    }

    // 7. POSITION UPDATE
    const forwardX = Math.sin(this.yaw);
    const forwardZ = Math.cos(this.yaw);

    this.pos.x += forwardX * newSpeedMps * dt;
    this.pos.z += forwardZ * newSpeedMps * dt;
    this.pos.y = proj.trackElevation + 0.35; // Stay on track surface elevation

    // 8. BARRIER COLLISION / RUNOFF PUSHBACK
    if (this.surface === 'barrier') {
      // Rebound bike back towards track center
      const pushDir = proj.binormal.clone().multiplyScalar(proj.lateralOffset > 0 ? -1 : 1);
      this.pos.addScaledVector(pushDir, 1.2);
      this.speedKmh *= 0.5; // Decelerate on impact
    }

    // 9. TIRE SLIDE & KNEE DRAGGING SPARKS
    const absLeanDeg = Math.abs(this.leanAngle) * (180 / Math.PI);
    this.sparking = absLeanDeg > 50 && this.speedKmh > 70 && (this.surface === 'tarmac' || this.surface === 'curb');
    this.tireSlide = (brake > 0.7 && this.speedKmh > 50) ? 0.8 : (absLeanDeg > 58 ? 0.5 : 0.0);

    // 10. LAP TIMING & CHECKPOINTS
    this.updateLapTiming(dt, proj);
  }

  updateLapTiming(dt, proj) {
    this.currentLapTime += dt;
    const u = proj.u;

    // Sector 1: 0 to 0.33
    if (u >= 0.1 && u < 0.33) {
      this.sectorPassed[0] = true;
    }
    // Sector 2: 0.33 to 0.66
    else if (u >= 0.33 && u < 0.66 && this.sectorPassed[0]) {
      if (!this.sectorPassed[1]) {
        this.sectorPassed[1] = true;
        this.sectorTimes[0] = this.currentLapTime;
      }
    }
    // Sector 3: 0.66 to 0.95
    else if (u >= 0.66 && u < 0.95 && this.sectorPassed[1]) {
      if (!this.sectorPassed[2]) {
        this.sectorPassed[2] = true;
        this.sectorTimes[1] = this.currentLapTime - (this.sectorTimes[0] || 0);
      }
    }
    // Crossing Finish Line (u wraps around 0)
    else if (u < 0.05 && this.sectorPassed[0] && this.sectorPassed[1] && this.sectorPassed[2]) {
      this.lastLapTime = this.currentLapTime;
      this.sectorTimes[2] = this.currentLapTime - (this.sectorTimes[1] || 0) - (this.sectorTimes[0] || 0);

      if (!this.bestLapTime || this.currentLapTime < this.bestLapTime) {
        this.bestLapTime = this.currentLapTime;
        this.bestSectorTimes = [...this.sectorTimes];
      }

      this.lap++;
      this.currentLapTime = 0;
      this.sectorPassed = [false, false, false];
    }
  }

  getTelemetry() {
    return {
      speedKmh: Math.round(this.speedKmh),
      gear: this.gear,
      rpm: Math.round(this.rpm),
      leanAngleDeg: Math.round(this.leanAngle * (180 / Math.PI)),
      nitro: this.nitro,
      isNitroActive: this.isNitroActive,
      isDrafting: this.isDrafting,
      sparking: this.sparking,
      lap: this.lap,
      currentLapTime: this.currentLapTime,
      bestLapTime: this.bestLapTime,
      lastLapTime: this.lastLapTime,
      surface: this.surface,
      u: this.trackDistance / this.circuit.totalLength
    };
  }
}

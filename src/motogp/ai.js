// Intelligence Artificielle MotoGP - Trajectoires de course, freinages optimisés et dépassements
import * as THREE from 'three';
import { BikePhysics } from './physics.js';
import { createMotoGPBike } from './models.js';

export class AIRider {
  constructor(team, circuit, difficulty = 'pro') {
    this.team = team;
    this.circuit = circuit;
    this.difficulty = difficulty;

    this.physics = new BikePhysics(team, circuit, false);
    this.model = createMotoGPBike(team, false);

    // Difficulty settings
    this.speedModifier = difficulty === 'legende' ? 1.02 : (difficulty === 'debutant' ? 0.88 : 0.96);
    this.bravery = difficulty === 'legende' ? 1.15 : (difficulty === 'debutant' ? 0.85 : 1.0);

    this.targetOffset = (Math.random() - 0.5) * 3.5; // Slight natural lateral lane preference
    this.lookaheadDist = 32.0; // Lookahead distance in meters
    this.overtakeTimer = 0;
  }

  setGridPosition(gridSlot) {
    // Staggered MotoGP grid: Slot 0 = Pole position (offset +2.5m)
    // Slot 1 = P2 (-2.5m, -8m back), Slot 2 = P3 (+2.5m, -16m back), etc.
    const row = Math.floor(gridSlot / 2);
    const col = gridSlot % 2;
    const lateral = col === 0 ? 2.5 : -2.5;
    const backDist = -(row * 10 + 4);

    const startU = (this.circuit.totalLength + backDist) % this.circuit.totalLength;
    this.physics.resetToTrack(startU, lateral);
    this.model.root.position.copy(this.physics.pos);
    this.model.root.rotation.y = this.physics.yaw;
  }

  update(dt, allRiders = []) {
    const phys = this.physics;
    const u = phys.trackDistance / this.circuit.totalLength;

    // 1. Target Point along track ahead
    const lookaheadU = ((phys.trackDistance + this.lookaheadDist) % this.circuit.totalLength) / this.circuit.totalLength;
    const targetPt = this.circuit.curve.getPointAt(lookaheadU);
    const targetTangent = this.circuit.curve.getTangentAt(lookaheadU).normalize();
    const right = new THREE.Vector3().crossVectors(targetTangent, new THREE.Vector3(0, 1, 0)).normalize();

    // 2. Dynamic Overtaking & Obstacle Avoidance
    let lateralShift = this.targetOffset;
    for (const other of allRiders) {
      if (other === this || !other) continue;
      const otherPhys = other.physics || other;
      const dist = phys.pos.distanceTo(otherPhys.pos);

      // If close and behind, choose alternative racing line to overtake
      if (dist < 18.0) {
        const toOther = new THREE.Vector3().subVectors(otherPhys.pos, phys.pos);
        const fwdDist = toOther.dot(targetTangent);
        if (fwdDist > 0 && fwdDist < 16.0) {
          // Bike in front! Check which side is open
          const sideDist = toOther.dot(right);
          lateralShift = sideDist > 0 ? -3.5 : 3.5; // Slip out to pass
          break;
        }
      }
    }

    const desiredTarget = targetPt.clone().addScaledVector(right, lateralShift);

    // 3. Steering Angle calculation
    const toTarget = new THREE.Vector3().subVectors(desiredTarget, phys.pos);
    const targetYaw = Math.atan2(-toTarget.z, toTarget.x) + Math.PI / 2;

    let yawDiff = targetYaw - phys.yaw;
    while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
    while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;

    const steerInput = Math.max(-1, Math.min(1, yawDiff * 2.8));

    // 4. Throttle & Braking logic based on ideal corner speed
    const idealSpeedKmh = this.circuit.getIdealSpeedKmh(lookaheadU) * this.speedModifier * this.bravery;
    let throttle = 1.0;
    let brake = 0.0;

    if (phys.speedKmh > idealSpeedKmh + 8) {
      // Need to brake into corner
      throttle = 0.0;
      brake = Math.min(1.0, (phys.speedKmh - idealSpeedKmh) / 28);
    } else if (phys.speedKmh > idealSpeedKmh) {
      // Coast or slight throttle
      throttle = 0.4;
      brake = 0.0;
    } else {
      // Full throttle on exit & straights
      throttle = 1.0;
      brake = 0.0;
    }

    // 5. Update Physics
    phys.update(dt, { throttle, brake, steer: steerInput, rearBrake: 0, nitro: false }, allRiders.map(r => r.physics || r));

    // 6. Update 3D Model visual position & leaning
    this.model.root.position.copy(phys.pos);
    this.model.root.rotation.y = phys.yaw;
    this.model.update(phys.leanAngle, phys.steerAngle, phys.speedKmh, throttle, brake, phys.sparking);
  }
}

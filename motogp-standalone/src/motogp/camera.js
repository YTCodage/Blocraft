// Gestionnaire multi-caméras MotoGP (Poursuite, Action, Casque FPV, Gyroscopique TV)
import * as THREE from 'three';

export class CameraManager {
  constructor(camera) {
    this.camera = camera;
    this.modeIndex = 0;
    this.modes = ['chase', 'action', 'helmet', 'gyro'];
    this.currentMode = 'chase';

    this.smoothPos = new THREE.Vector3();
    this.smoothLook = new THREE.Vector3();
    this.baseFov = 64;
    this.camera.fov = this.baseFov;
    this.camera.updateProjectionMatrix();

    this.shake = 0;
  }

  nextMode() {
    this.modeIndex = (this.modeIndex + 1) % this.modes.length;
    this.currentMode = this.modes[this.modeIndex];
    return this.getModeName();
  }

  getModeName() {
    switch (this.currentMode) {
      case 'chase': return 'Vue Poursuite 3D';
      case 'action': return 'Vue Action Rase-Bitume';
      case 'helmet': return 'Vue Casque Pilote (FPV)';
      case 'gyro': return 'Caméra Gyro TV Officielle';
      default: return 'Vue Poursuite';
    }
  }

  update(dt, playerPhys) {
    const pos = playerPhys.pos;
    const yaw = playerPhys.yaw;
    const lean = playerPhys.leanAngle;
    const speed = playerPhys.speedKmh;

    const fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(fwd, up).normalize();

    // Speed sensation: FOV kicks out as speed exceeds 200 km/h
    const fovTarget = this.baseFov + Math.min(22, (speed / 350) * 22);
    this.camera.fov += (fovTarget - this.camera.fov) * 0.1;
    this.camera.updateProjectionMatrix();

    // High speed vibration
    if (speed > 160) {
      const shakeAmt = ((speed - 160) / 200) * 0.035;
      this.shake = (Math.random() - 0.5) * shakeAmt;
    } else {
      this.shake = 0;
    }

    if (this.currentMode === 'chase') {
      // Dynamic follow camera
      const camDist = 4.8;
      const camHeight = 1.95;
      const targetPos = pos.clone()
        .addScaledVector(fwd, -camDist)
        .add(new THREE.Vector3(0, camHeight, 0))
        .addScaledVector(right, -lean * 0.6);

      const lookTarget = pos.clone().addScaledVector(fwd, 6.0).add(new THREE.Vector3(0, 0.9, 0));

      this.smoothPos.lerp(targetPos, Math.min(1, dt * 14));
      this.smoothLook.lerp(lookTarget, Math.min(1, dt * 16));

      this.camera.position.copy(this.smoothPos).add(new THREE.Vector3(0, this.shake, 0));
      this.camera.lookAt(this.smoothLook);
      this.camera.rotation.z = -lean * 0.15; // Subtle lean tilt
    }
    else if (this.currentMode === 'action') {
      // Low close dynamic cam
      const camDist = 3.2;
      const camHeight = 1.25;
      const targetPos = pos.clone()
        .addScaledVector(fwd, -camDist)
        .add(new THREE.Vector3(0, camHeight, 0))
        .addScaledVector(right, -lean * 0.4);

      const lookTarget = pos.clone().addScaledVector(fwd, 8.0).add(new THREE.Vector3(0, 0.7, 0));

      this.smoothPos.lerp(targetPos, Math.min(1, dt * 18));
      this.smoothLook.lerp(lookTarget, Math.min(1, dt * 20));

      this.camera.position.copy(this.smoothPos).add(new THREE.Vector3(0, this.shake * 1.5, 0));
      this.camera.lookAt(this.smoothLook);
      this.camera.rotation.z = -lean * 0.25;
    }
    else if (this.currentMode === 'helmet') {
      // Inside helmet FPV
      const helmetPos = pos.clone().addScaledVector(fwd, 0.05).add(new THREE.Vector3(0, 1.15, 0));
      const lookTarget = pos.clone().addScaledVector(fwd, 15.0).add(new THREE.Vector3(0, 1.1, 0));

      // Tilts with rider head
      this.camera.position.copy(helmetPos).add(new THREE.Vector3(0, this.shake * 1.2, 0));
      this.camera.lookAt(lookTarget);
      this.camera.rotation.z = -lean * 0.55;
    }
    else if (this.currentMode === 'gyro') {
      // Gyroscopic on-board tail cam (Locked to horizon like MotoGP broadcast)
      const tailPos = pos.clone().addScaledVector(fwd, -1.4).add(new THREE.Vector3(0, 1.3, 0));
      const lookTarget = pos.clone().addScaledVector(fwd, 12.0).add(new THREE.Vector3(0, 0.8, 0));

      this.camera.position.copy(tailPos).add(new THREE.Vector3(0, this.shake, 0));
      this.camera.lookAt(lookTarget);
      this.camera.rotation.z = 0; // Fixed horizon!
    }
  }
}

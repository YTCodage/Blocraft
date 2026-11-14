// Création procédurale 3D de motos et pilotes MotoGP officiels
import * as THREE from 'three';

export function createMotoGPBike(team, isPlayer = false) {
  const root = new THREE.Group();
  root.name = `bike_${team.id}`;

  const primaryColor = new THREE.Color(team.color);
  const accentColor = new THREE.Color(team.accentColor);
  const suitColor = new THREE.Color(team.suitColor || team.color);
  const helmetColor = new THREE.Color(team.helmetColor || team.color);

  // Shared reusable materials
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x181818,
    roughness: 0.4,
    metalness: 0.2
  });

  const fairingMat = new THREE.MeshStandardMaterial({
    color: primaryColor,
    roughness: 0.25,
    metalness: 0.35
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.25,
    metalness: 0.4
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x151515,
    roughness: 0.85,
    metalness: 0.05
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x101010,
    roughness: 0.3,
    metalness: 0.8
  });

  const goldForkMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.2,
    metalness: 0.9
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.15,
    metalness: 0.95
  });

  const brakeDiscMat = new THREE.MeshStandardMaterial({
    color: 0x777777,
    roughness: 0.3,
    metalness: 0.7
  });

  const brakeCaliperMat = new THREE.MeshStandardMaterial({
    color: 0xcc0000,
    roughness: 0.3,
    metalness: 0.6
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.45,
    roughness: 0.05,
    transmission: 0.9,
    ior: 1.5
  });

  const exhaustMat = new THREE.MeshStandardMaterial({
    color: 0x706c64,
    roughness: 0.35,
    metalness: 0.85
  });

  // Base bike container (tilts when leaning)
  const bikeBody = new THREE.Group();
  bikeBody.position.y = 0.38; // Height above ground
  root.add(bikeBody);

  // 1. CHASSIS / TWIN-SPAR FRAME
  const frameGeo = new THREE.BoxGeometry(0.32, 0.28, 0.9);
  const frameMesh = new THREE.Mesh(frameGeo, carbonMat);
  frameMesh.position.set(0, 0.22, 0.05);
  bikeBody.add(frameMesh);

  // 2. ENGINE BLOCK
  const engineGeo = new THREE.BoxGeometry(0.3, 0.26, 0.45);
  const engineMesh = new THREE.Mesh(engineGeo, chromeMat);
  engineMesh.position.set(0, 0.1, 0.05);
  bikeBody.add(engineMesh);

  // Radiator
  const radGeo = new THREE.BoxGeometry(0.28, 0.25, 0.08);
  const radMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6, metalness: 0.5 });
  const radMesh = new THREE.Mesh(radGeo, radMat);
  radMesh.position.set(0, 0.18, 0.38);
  radMesh.rotation.x = -0.2;
  bikeBody.add(radMesh);

  // 3. MAIN FAIRING & AERO WINGLETS
  // Nose fairing
  const noseGeo = new THREE.ConeGeometry(0.24, 0.7, 5);
  noseGeo.rotateX(Math.PI / 2);
  noseGeo.rotateZ(Math.PI / 5);
  const noseMesh = new THREE.Mesh(noseGeo, fairingMat);
  noseMesh.position.set(0, 0.42, 0.48);
  noseMesh.scale.set(0.85, 0.75, 1.1);
  bikeBody.add(noseMesh);

  // Aerodynamic Winglets (Front Ground-Effect Wings)
  const wingGeo = new THREE.BoxGeometry(0.32, 0.02, 0.16);
  const leftWing = new THREE.Mesh(wingGeo, carbonMat);
  leftWing.position.set(0.22, 0.42, 0.65);
  leftWing.rotation.set(-0.15, 0.2, -0.15);
  bikeBody.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo, carbonMat);
  rightWing.position.set(-0.22, 0.42, 0.65);
  rightWing.rotation.set(-0.15, -0.2, 0.15);
  bikeBody.add(rightWing);

  // Lower Winglets
  const lowWingGeo = new THREE.BoxGeometry(0.22, 0.015, 0.12);
  const leftLowWing = new THREE.Mesh(lowWingGeo, accentMat);
  leftLowWing.position.set(0.20, 0.26, 0.52);
  leftLowWing.rotation.set(-0.1, 0.15, -0.1);
  bikeBody.add(leftLowWing);

  const rightLowWing = new THREE.Mesh(lowWingGeo, accentMat);
  rightLowWing.position.set(-0.20, 0.26, 0.52);
  rightLowWing.rotation.set(-0.1, -0.15, 0.1);
  bikeBody.add(rightLowWing);

  // Windscreen
  const screenGeo = new THREE.CylinderGeometry(0.12, 0.2, 0.32, 8, 1, true, 0, Math.PI);
  const screenMesh = new THREE.Mesh(screenGeo, glassMat);
  screenMesh.position.set(0, 0.58, 0.45);
  screenMesh.rotation.set(0.65, 0, Math.PI);
  bikeBody.add(screenMesh);

  // Side belly pan / Lower fairing
  const bellyGeo = new THREE.BoxGeometry(0.3, 0.18, 0.85);
  const bellyMesh = new THREE.Mesh(bellyGeo, accentMat);
  bellyMesh.position.set(0, 0.02, 0.05);
  bikeBody.add(bellyMesh);

  // 4. FUEL TANK & SEAT
  const tankGeo = new THREE.BoxGeometry(0.3, 0.22, 0.45);
  const tankMesh = new THREE.Mesh(tankGeo, fairingMat);
  tankMesh.position.set(0, 0.42, 0.08);
  tankMesh.rotation.x = -0.12;
  bikeBody.add(tankMesh);

  // Seat
  const seatGeo = new THREE.BoxGeometry(0.24, 0.08, 0.35);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  const seatMesh = new THREE.Mesh(seatGeo, seatMat);
  seatMesh.position.set(0, 0.36, -0.25);
  seatMesh.rotation.x = 0.08;
  bikeBody.add(seatMesh);

  // Tail Cowl & Rear Aero Fin
  const tailGeo = new THREE.ConeGeometry(0.18, 0.5, 5);
  tailGeo.rotateX(-Math.PI / 2);
  tailGeo.rotateZ(Math.PI / 5);
  const tailMesh = new THREE.Mesh(tailGeo, fairingMat);
  tailMesh.position.set(0, 0.42, -0.55);
  tailMesh.scale.set(0.9, 0.65, 1.0);
  bikeBody.add(tailMesh);

  // Tail spoiler / wings
  const tailWingGeo = new THREE.BoxGeometry(0.26, 0.015, 0.1);
  const tailWing = new THREE.Mesh(tailWingGeo, carbonMat);
  tailWing.position.set(0, 0.5, -0.72);
  tailWing.rotation.x = -0.18;
  bikeBody.add(tailWing);

  // Number Plate Front & Rear
  const numberTex = createNumberTexture(team.number, team.numberColor, team.color);
  const numberMat = new THREE.MeshBasicMaterial({ map: numberTex, transparent: true });
  const numberGeo = new THREE.PlaneGeometry(0.18, 0.14);
  const frontNum = new THREE.Mesh(numberGeo, numberMat);
  frontNum.position.set(0, 0.50, 0.67);
  frontNum.rotation.x = -0.4;
  bikeBody.add(frontNum);

  // 5. EXHAUST SYSTEM
  // Side Akrapovic Titanium Silencer
  const exhaustGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.45, 12);
  exhaustGeo.rotateX(Math.PI / 2);
  const exhaustMesh = new THREE.Mesh(exhaustGeo, exhaustMat);
  exhaustMesh.position.set(0.19, 0.16, -0.42);
  exhaustMesh.rotation.set(0.22, -0.12, 0.05);
  bikeBody.add(exhaustMesh);

  // Tail underseat exhaust tip
  const tailExhaustGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.15, 10);
  tailExhaustGeo.rotateX(Math.PI / 2);
  const tailExhaust = new THREE.Mesh(tailExhaustGeo, exhaustMat);
  tailExhaust.position.set(0, 0.42, -0.82);
  bikeBody.add(tailExhaust);

  // 6. FRONT FORK & STEERING ASSEMBLY
  const steerAssembly = new THREE.Group();
  steerAssembly.position.set(0, 0.28, 0.52);
  steerAssembly.rotation.x = 0.38; // Rake angle ~22°
  bikeBody.add(steerAssembly);

  // Fork tubes (Golden upside-down Ohlins)
  const forkTubeGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.55, 10);
  const leftFork = new THREE.Mesh(forkTubeGeo, goldForkMat);
  leftFork.position.set(0.1, -0.18, 0);
  steerAssembly.add(leftFork);

  const rightFork = new THREE.Mesh(forkTubeGeo, goldForkMat);
  rightFork.position.set(-0.1, -0.18, 0);
  steerAssembly.add(rightFork);

  // Handlebars / Clip-ons
  const barGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.48, 8);
  barGeo.rotateZ(Math.PI / 2);
  const barMesh = new THREE.Mesh(barGeo, carbonMat);
  barMesh.position.set(0, 0.12, -0.02);
  steerAssembly.add(barMesh);

  // TFT Dash screen
  const dashGeo = new THREE.BoxGeometry(0.12, 0.07, 0.02);
  const dashMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
  const dashMesh = new THREE.Mesh(dashGeo, dashMat);
  dashMesh.position.set(0, 0.14, -0.05);
  dashMesh.rotation.x = -0.6;
  steerAssembly.add(dashMesh);

  // 7. FRONT WHEEL
  const frontWheelGroup = new THREE.Group();
  frontWheelGroup.position.set(0, -0.42, 0);
  steerAssembly.add(frontWheelGroup);

  const frontTireGeo = new THREE.TorusGeometry(0.30, 0.065, 14, 28);
  const frontTire = new THREE.Mesh(frontTireGeo, tireMat);
  frontTire.rotation.y = Math.PI / 2;
  frontWheelGroup.add(frontTire);

  // 5-Spoke rim
  const rimGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.08, 16);
  rimGeo.rotateZ(Math.PI / 2);
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  frontWheelGroup.add(rimMesh);

  // Dual Brembo front brake discs
  const discGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.01, 16);
  discGeo.rotateZ(Math.PI / 2);
  const leftDisc = new THREE.Mesh(discGeo, brakeDiscMat);
  leftDisc.position.x = 0.065;
  frontWheelGroup.add(leftDisc);

  const rightDisc = new THREE.Mesh(discGeo, brakeDiscMat);
  rightDisc.position.x = -0.065;
  frontWheelGroup.add(rightDisc);

  // Brembo brake calipers
  const caliperGeo = new THREE.BoxGeometry(0.035, 0.09, 0.07);
  const leftCaliper = new THREE.Mesh(caliperGeo, brakeCaliperMat);
  leftCaliper.position.set(0.085, 0.07, -0.12);
  frontWheelGroup.add(leftCaliper);

  const rightCaliper = new THREE.Mesh(caliperGeo, brakeCaliperMat);
  rightCaliper.position.set(-0.085, 0.07, -0.12);
  frontWheelGroup.add(rightCaliper);

  // 8. REAR SWINGARM & REAR WHEEL
  const swingarmGroup = new THREE.Group();
  swingarmGroup.position.set(0, 0.08, -0.15);
  bikeBody.add(swingarmGroup);

  const swingarmGeo = new THREE.BoxGeometry(0.26, 0.06, 0.62);
  const swingarmMesh = new THREE.Mesh(swingarmGeo, carbonMat);
  swingarmMesh.position.set(0, -0.08, -0.32);
  swingarmMesh.rotation.x = -0.14;
  swingarmGroup.add(swingarmMesh);

  // Rear Mono-shock
  const shockGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.22, 10);
  const shockMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.8 });
  const shockMesh = new THREE.Mesh(shockGeo, shockMat);
  shockMesh.position.set(0, 0.04, -0.12);
  shockMesh.rotation.x = 0.45;
  swingarmGroup.add(shockMesh);

  // Rear Wheel
  const rearWheelGroup = new THREE.Group();
  rearWheelGroup.position.set(0, -0.16, -0.65);
  swingarmGroup.add(rearWheelGroup);

  const rearTireGeo = new THREE.TorusGeometry(0.31, 0.085, 16, 28);
  const rearTire = new THREE.Mesh(rearTireGeo, tireMat);
  rearTire.rotation.y = Math.PI / 2;
  rearWheelGroup.add(rearTire);

  const rearRimGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.12, 16);
  rearRimGeo.rotateZ(Math.PI / 2);
  const rearRim = new THREE.Mesh(rearRimGeo, rimMat);
  rearWheelGroup.add(rearRim);

  // Rear Sprocket
  const sprocketGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.015, 16);
  sprocketGeo.rotateZ(Math.PI / 2);
  const sprocketMesh = new THREE.Mesh(sprocketGeo, goldForkMat);
  sprocketMesh.position.x = 0.09;
  rearWheelGroup.add(sprocketMesh);

  // 9. RIDER (Articulated pilot)
  const riderGroup = new THREE.Group();
  riderGroup.position.set(0, 0.42, -0.22);
  bikeBody.add(riderGroup);

  const suitMat = new THREE.MeshStandardMaterial({
    color: suitColor,
    roughness: 0.6,
    metalness: 0.1
  });

  const helmetMat = new THREE.MeshStandardMaterial({
    color: helmetColor,
    roughness: 0.25,
    metalness: 0.4
  });

  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.08,
    metalness: 0.95
  });

  // Pelvis / Hips
  const hipsGeo = new THREE.BoxGeometry(0.24, 0.14, 0.22);
  const hipsMesh = new THREE.Mesh(hipsGeo, suitMat);
  hipsMesh.position.set(0, 0.02, 0);
  riderGroup.add(hipsMesh);

  // Spine / Upper Torso with Aerodynamic Race Hump
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.1, 0);
  riderGroup.add(torsoGroup);

  const chestGeo = new THREE.BoxGeometry(0.28, 0.32, 0.24);
  const chestMesh = new THREE.Mesh(chestGeo, suitMat);
  chestMesh.position.set(0, 0.15, 0.06);
  chestMesh.rotation.x = 0.55; // Natural racing lean
  torsoGroup.add(chestMesh);

  // Aerodynamic speed hump on upper back
  const humpGeo = new THREE.ConeGeometry(0.12, 0.30, 6);
  humpGeo.rotateX(Math.PI / 2);
  const humpMesh = new THREE.Mesh(humpGeo, carbonMat);
  humpMesh.position.set(0, 0.24, -0.06);
  humpMesh.rotation.x = -0.3;
  torsoGroup.add(humpMesh);

  // Head and Helmet
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.38, 0.20);
  torsoGroup.add(headGroup);

  const helmetGeo = new THREE.SphereGeometry(0.14, 16, 14);
  helmetGeo.scale(0.95, 1.1, 1.15);
  const helmetMesh = new THREE.Mesh(helmetGeo, helmetMat);
  headGroup.add(helmetMesh);

  // Visor
  const visorGeo = new THREE.BoxGeometry(0.18, 0.08, 0.1);
  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.position.set(0, 0.02, 0.11);
  headGroup.add(visorMesh);

  // Left Arm
  const armGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.34, 8);
  armGeo.rotateX(Math.PI / 2);
  const leftArm = new THREE.Mesh(armGeo, suitMat);
  leftArm.position.set(0.18, 0.18, 0.24);
  leftArm.rotation.set(0.35, 0.15, -0.3);
  torsoGroup.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Mesh(armGeo, suitMat);
  rightArm.position.set(-0.18, 0.18, 0.24);
  rightArm.rotation.set(0.35, -0.15, 0.3);
  torsoGroup.add(rightArm);

  // Left Leg & Knee Slider
  const legGroupL = new THREE.Group();
  legGroupL.position.set(0.14, 0, 0.05);
  riderGroup.add(legGroupL);

  const thighGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.32, 8);
  const leftThigh = new THREE.Mesh(thighGeo, suitMat);
  leftThigh.position.set(0.04, -0.08, 0.08);
  leftThigh.rotation.set(0.7, 0.25, -0.2);
  legGroupL.add(leftThigh);

  const puckMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.8 });
  const puckGeo = new THREE.BoxGeometry(0.05, 0.06, 0.03);
  const leftPuck = new THREE.Mesh(puckGeo, puckMat);
  leftPuck.position.set(0.14, -0.16, 0.18);
  legGroupL.add(leftPuck);

  // Right Leg & Knee Slider
  const legGroupR = new THREE.Group();
  legGroupR.position.set(-0.14, 0, 0.05);
  riderGroup.add(legGroupR);

  const rightThigh = new THREE.Mesh(thighGeo, suitMat);
  rightThigh.position.set(-0.04, -0.08, 0.08);
  rightThigh.rotation.set(0.7, -0.25, 0.2);
  legGroupR.add(rightThigh);

  const rightPuck = new THREE.Mesh(puckGeo, puckMat);
  rightPuck.position.set(-0.14, -0.16, 0.18);
  legGroupR.add(rightPuck);

  // Sparks particle system for knee slider dragging
  const sparkGeo = new THREE.BufferGeometry();
  const sparkCount = 18;
  const sparkPositions = new Float32Array(sparkCount * 3);
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
  const sparkMat = new THREE.PointsMaterial({
    color: 0xffaa22,
    size: 0.08,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });
  const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
  sparkPoints.visible = false;
  root.add(sparkPoints);

  return {
    root,
    bikeBody,
    steerAssembly,
    frontWheelGroup,
    rearWheelGroup,
    riderGroup,
    torsoGroup,
    headGroup,
    legGroupL,
    legGroupR,
    sparkPoints,
    team,
    isPlayer,
    currentLean: 0,
    currentPitch: 0,
    wheelRot: 0,

    update(leanAngleRad, steerAngleRad, speedKmh, throttle, brake, isSparking = false) {
      // 1. Roll / Lean angle for bike and rider
      this.bikeBody.rotation.z = -leanAngleRad;

      // 2. Front wheel steering
      this.steerAssembly.rotation.y = steerAngleRad * 0.4;

      // 3. Wheel rotation proportional to forward speed
      const rotDelta = (speedKmh / 3.6) * 0.016 / 0.31; // v = w * r
      this.wheelRot += rotDelta;
      this.frontWheelGroup.rotation.x = this.wheelRot;
      this.rearWheelGroup.rotation.x = this.wheelRot;

      // 4. Suspension dive on braking & squat on acceleration
      const pitchTarget = (brake * 0.08) - (throttle * 0.04);
      this.currentPitch += (pitchTarget - this.currentPitch) * 0.15;
      this.bikeBody.rotation.x = this.currentPitch;

      // 5. Rider Hang-off dynamics (rider shifts off the bike inside the corner)
      const leanNorm = Math.max(-1, Math.min(1, leanAngleRad / 1.15)); // max 66 deg
      this.riderGroup.position.x = leanNorm * 0.14;
      this.riderGroup.rotation.z = leanNorm * 0.22;

      // Inside knee slider pops out into the turn
      if (leanNorm > 0.15) {
        this.legGroupL.rotation.y = leanNorm * 0.7;
        this.legGroupR.rotation.y = 0;
      } else if (leanNorm < -0.15) {
        this.legGroupR.rotation.y = leanNorm * 0.7;
        this.legGroupL.rotation.y = 0;
      } else {
        this.legGroupL.rotation.y = 0;
        this.legGroupR.rotation.y = 0;
      }

      // 6. Aerodynamic Tuck on straights vs Air-brake when stopping
      if (speedKmh > 120 && throttle > 0.4) {
        // Flat aerodynamic tuck behind windscreen
        this.torsoGroup.rotation.x = 0.35;
        this.torsoGroup.position.y = 0.04;
        this.torsoGroup.position.z = 0.08;
        this.headGroup.rotation.x = -0.3; // Look up down the track
      } else if (brake > 0.3) {
        // Sit up to act as air brake
        this.torsoGroup.rotation.x = -0.25;
        this.torsoGroup.position.y = 0.12;
        this.torsoGroup.position.z = -0.05;
        this.headGroup.rotation.x = 0.1;
      } else {
        // Normal neutral position
        this.torsoGroup.rotation.x = 0;
        this.torsoGroup.position.y = 0.1;
        this.torsoGroup.position.z = 0;
        this.headGroup.rotation.x = 0;
      }

      // 7. Knee slider sparks when dragging knee on tarmac
      if (isSparking && Math.abs(leanNorm) > 0.7) {
        this.sparkPoints.visible = true;
        const positions = this.sparkPoints.geometry.attributes.position.array;
        const side = leanNorm > 0 ? 1 : -1;
        const originX = side * 0.38;
        const originY = 0.08;
        const originZ = -0.15;
        for (let i = 0; i < sparkCount; i++) {
          positions[i * 3 + 0] = originX + (Math.random() - 0.5) * 0.12;
          positions[i * 3 + 1] = originY + Math.random() * 0.08;
          positions[i * 3 + 2] = originZ - Math.random() * 0.4;
        }
        this.sparkPoints.geometry.attributes.position.needsUpdate = true;
      } else {
        this.sparkPoints.visible = false;
      }
    }
  };
}

// Génère une texture de dossard / numéro de course
function createNumberTexture(num, textColorHex, bgHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

  // Number text with thick outline
  ctx.fillStyle = textColorHex;
  ctx.font = 'bold 120px Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 16;
  ctx.strokeText(num.toString(), canvas.width / 2, canvas.height / 2);
  ctx.fillText(num.toString(), canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

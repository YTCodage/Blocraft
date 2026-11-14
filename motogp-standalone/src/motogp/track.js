// Générateur procédural de circuits 3D MotoGP (Le Mans, Mugello, Valencia)
import * as THREE from 'three';

export class Circuit {
  constructor(definition, weatherPreset) {
    this.def = definition;
    this.weather = weatherPreset;
    this.scale = definition.scale || 3.0;
    this.roadWidth = definition.roadWidth || 14.0;
    this.curbWidth = 2.2;
    this.runoffWidth = 6.0;
    this.gravelWidth = 14.0;

    this.group = new THREE.Group();
    this.startLights = [];
    this.curve = null;
    this.totalLength = 0;
    this.samples = [];
    this.numSamples = 600;

    this.initCurve();
    this.buildTrackGeometry();
    this.buildScenery();
    this.buildStartGantry();
    this.buildGrandstands();
    this.buildBrakeMarkers();
    this.buildSponsorBridges();
    if (this.weather.rain) {
      this.buildRainSystem();
    }
  }

  initCurve() {
    // Scale definition points
    const vectors = this.def.points.map(p => {
      return new THREE.Vector3(p[0] * this.scale, p[1] * this.scale, p[2] * this.scale);
    });

    this.curve = new THREE.CatmullRomCurve3(vectors, true, 'centripetal', 0.5);
    this.totalLength = this.curve.getLength();

    // Pre-sample evenly spaced points along track
    this.samples = [];
    for (let i = 0; i <= this.numSamples; i++) {
      const u = i / this.numSamples;
      const point = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u).normalize();
      const up = new THREE.Vector3(0, 1, 0);

      // Compute banking and normal vectors
      const binormal = new THREE.Vector3().crossVectors(tangent, up).normalize();
      const normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize();

      // Curvature estimate (angle between previous and next tangent)
      const uNext = Math.min(1, u + 0.01);
      const tNext = this.curve.getTangentAt(uNext).normalize();
      const curvature = tangent.angleTo(tNext) * 100;

      this.samples.push({
        u,
        dist: u * this.totalLength,
        point,
        tangent,
        binormal,
        normal,
        curvature
      });
    }
  }

  buildTrackGeometry() {
    // 1. Asphalt Road Texture
    const roadTexture = this.createRoadTexture();
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: this.weather.rain ? 0.25 : 0.8,
      metalness: this.weather.rain ? 0.4 : 0.05
    });

    // 2. Curb Texture (Red and White alternating teeth)
    const curbTexture = this.createCurbTexture();
    const curbMat = new THREE.MeshStandardMaterial({
      map: curbTexture,
      roughness: 0.6,
      metalness: 0.1
    });

    // 3. Gravel Texture
    const gravelTexture = this.createGravelTexture();
    const gravelMat = new THREE.MeshStandardMaterial({
      map: gravelTexture,
      roughness: 0.95,
      metalness: 0.05
    });

    // 4. AstroTurf / Runoff Texture
    const runoffMat = new THREE.MeshStandardMaterial({
      color: 0x1d5c22,
      roughness: 0.85,
      metalness: 0.05
    });

    // Build ribbon meshes along sampled points
    const segCount = this.numSamples;
    const roadGeom = new THREE.BufferGeometry();
    const curbGeomL = new THREE.BufferGeometry();
    const curbGeomR = new THREE.BufferGeometry();
    const gravelGeom = new THREE.BufferGeometry();

    const roadVerts = [];
    const roadUVs = [];
    const roadNorms = [];

    const curbLVerts = [];
    const curbLUVs = [];
    const curbRVerts = [];
    const curbRUVs = [];

    const gravelVerts = [];
    const gravelUVs = [];

    const halfW = this.roadWidth * 0.5;
    const curbW = this.curbWidth;
    const gravW = this.gravelWidth;

    for (let i = 0; i < segCount; i++) {
      const s0 = this.samples[i];
      const s1 = this.samples[(i + 1) % segCount];

      const v0_cL = s0.point.clone().addScaledVector(s0.binormal, -halfW);
      const v0_cR = s0.point.clone().addScaledVector(s0.binormal, halfW);
      const v1_cL = s1.point.clone().addScaledVector(s1.binormal, -halfW);
      const v1_cR = s1.point.clone().addScaledVector(s1.binormal, halfW);

      // Road quad (2 triangles)
      roadVerts.push(
        v0_cL.x, v0_cL.y, v0_cL.z,
        v0_cR.x, v0_cR.y, v0_cR.z,
        v1_cL.x, v1_cL.y, v1_cL.z,

        v1_cL.x, v1_cL.y, v1_cL.z,
        v0_cR.x, v0_cR.y, v0_cR.z,
        v1_cR.x, v1_cR.y, v1_cR.z
      );

      const uvU0 = i * 0.5;
      const uvU1 = (i + 1) * 0.5;
      roadUVs.push(
        0, uvU0,
        1, uvU0,
        0, uvU1,

        0, uvU1,
        1, uvU0,
        1, uvU1
      );

      for (let n = 0; n < 6; n++) {
        roadNorms.push(0, 1, 0);
      }

      // Curbs on corners
      const hasCurb = s0.curvature > 0.4 || s1.curvature > 0.4;
      if (hasCurb) {
        // Left Curb
        const v0_curbL = v0_cL.clone().addScaledVector(s0.binormal, -curbW).add(new THREE.Vector3(0, 0.08, 0));
        const v1_curbL = v1_cL.clone().addScaledVector(s1.binormal, -curbW).add(new THREE.Vector3(0, 0.08, 0));

        curbLVerts.push(
          v0_curbL.x, v0_curbL.y, v0_curbL.z,
          v0_cL.x, v0_cL.y, v0_cL.z,
          v1_curbL.x, v1_curbL.y, v1_curbL.z,

          v1_curbL.x, v1_curbL.y, v1_curbL.z,
          v0_cL.x, v0_cL.y, v0_cL.z,
          v1_cL.x, v1_cL.y, v1_cL.z
        );
        curbLUVs.push(0, uvU0 * 2, 1, uvU0 * 2, 0, uvU1 * 2, 0, uvU1 * 2, 1, uvU0 * 2, 1, uvU1 * 2);

        // Right Curb
        const v0_curbR = v0_cR.clone().addScaledVector(s0.binormal, curbW).add(new THREE.Vector3(0, 0.08, 0));
        const v1_curbR = v1_cR.clone().addScaledVector(s1.binormal, curbW).add(new THREE.Vector3(0, 0.08, 0));

        curbRVerts.push(
          v0_cR.x, v0_cR.y, v0_cR.z,
          v0_curbR.x, v0_curbR.y, v0_curbR.z,
          v1_cR.x, v1_cR.y, v1_cR.z,

          v1_cR.x, v1_cR.y, v1_cR.z,
          v0_curbR.x, v0_curbR.y, v0_curbR.z,
          v1_curbR.x, v1_curbR.y, v1_curbR.z
        );
        curbRUVs.push(0, uvU0 * 2, 1, uvU0 * 2, 0, uvU1 * 2, 0, uvU1 * 2, 1, uvU0 * 2, 1, uvU1 * 2);
      }

      // Gravel Traps on outer zone
      const v0_gL = v0_cL.clone().addScaledVector(s0.binormal, -(curbW + gravW));
      const v1_gL = v1_cL.clone().addScaledVector(s1.binormal, -(curbW + gravW));
      const v0_gR = v0_cR.clone().addScaledVector(s0.binormal, (curbW + gravW));
      const v1_gR = v1_cR.clone().addScaledVector(s1.binormal, (curbW + gravW));

      gravelVerts.push(
        v0_gL.x, v0_gL.y - 0.05, v0_gL.z,
        v0_cL.x, v0_cL.y - 0.05, v0_cL.z,
        v1_gL.x, v1_gL.y - 0.05, v1_gL.z,

        v1_gL.x, v1_gL.y - 0.05, v1_gL.z,
        v0_cL.x, v0_cL.y - 0.05, v0_cL.z,
        v1_cL.x, v1_cL.y - 0.05, v1_cL.z,

        v0_cR.x, v0_cR.y - 0.05, v0_cR.z,
        v0_gR.x, v0_gR.y - 0.05, v0_gR.z,
        v1_cR.x, v1_cR.y - 0.05, v1_cR.z,

        v1_cR.x, v1_cR.y - 0.05, v1_cR.z,
        v0_gR.x, v0_gR.y - 0.05, v0_gR.z,
        v1_gR.x, v1_gR.y - 0.05, v1_gR.z
      );

      gravelUVs.push(
        0, uvU0 * 0.4, 1, uvU0 * 0.4, 0, uvU1 * 0.4,
        0, uvU1 * 0.4, 1, uvU0 * 0.4, 1, uvU1 * 0.4,
        0, uvU0 * 0.4, 1, uvU0 * 0.4, 0, uvU1 * 0.4,
        0, uvU1 * 0.4, 1, uvU0 * 0.4, 1, uvU1 * 0.4
      );
    }

    roadGeom.setAttribute('position', new THREE.Float32BufferAttribute(roadVerts, 3));
    roadGeom.setAttribute('uv', new THREE.Float32BufferAttribute(roadUVs, 2));
    roadGeom.setAttribute('normal', new THREE.Float32BufferAttribute(roadNorms, 3));
    this.group.add(new THREE.Mesh(roadGeom, roadMat));

    if (curbLVerts.length > 0) {
      curbGeomL.setAttribute('position', new THREE.Float32BufferAttribute(curbLVerts, 3));
      curbGeomL.setAttribute('uv', new THREE.Float32BufferAttribute(curbLUVs, 2));
      curbGeomL.computeVertexNormals();
      this.group.add(new THREE.Mesh(curbGeomL, curbMat));
    }

    if (curbRVerts.length > 0) {
      curbGeomR.setAttribute('position', new THREE.Float32BufferAttribute(curbRVerts, 3));
      curbGeomR.setAttribute('uv', new THREE.Float32BufferAttribute(curbRUVs, 2));
      curbGeomR.computeVertexNormals();
      this.group.add(new THREE.Mesh(curbGeomR, curbMat));
    }

    if (gravelVerts.length > 0) {
      gravelGeom.setAttribute('position', new THREE.Float32BufferAttribute(gravelVerts, 3));
      gravelGeom.setAttribute('uv', new THREE.Float32BufferAttribute(gravelUVs, 2));
      gravelGeom.computeVertexNormals();
      this.group.add(new THREE.Mesh(gravelGeom, gravelMat));
    }
  }

  createRoadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Asphalt grey base
    ctx.fillStyle = '#232526';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Fine asphalt grain noise
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 22;
      data[i] = Math.max(0, Math.min(255, data[i] + n));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    // Dark racing line groove (rubbered-in line)
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.35, 'rgba(12,12,14,0.4)');
    grad.addColorStop(0.5, 'rgba(10,10,12,0.6)');
    grad.addColorStop(0.65, 'rgba(12,12,14,0.4)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // White outer track boundary lines
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(16, 0, 10, canvas.height);
    ctx.fillRect(canvas.width - 26, 0, 10, canvas.height);

    // Subtle dashed center line
    ctx.fillStyle = '#eeeeee';
    for (let y = 0; y < canvas.height; y += 64) {
      ctx.fillRect(canvas.width / 2 - 3, y, 6, 32);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 8);
    texture.anisotropy = 8;
    return texture;
  }

  createCurbTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Alternating red and white curb stripes
    for (let y = 0; y < canvas.height; y += 64) {
      ctx.fillStyle = '#d32f2f'; // Red
      ctx.fillRect(0, y, canvas.width, 32);
      ctx.fillStyle = '#ffffff'; // White
      ctx.fillRect(0, y + 32, canvas.width, 32);
    }

    // Bevel highlights
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0.4)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 12);
    return texture;
  }

  createGravelTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#a89476'; // Light beige gravel
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Noise pebbles
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = 1 + Math.random() * 2.5;
      const shade = Math.floor(130 + Math.random() * 80);
      ctx.fillStyle = `rgb(${shade + 20}, ${shade}, ${shade - 20})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 16);
    return texture;
  }

  buildScenery() {
    // Vast ground terrain surrounding the track
    const terrainGeo = new THREE.PlaneGeometry(3500, 3500, 32, 32);
    terrainGeo.rotateX(-Math.PI / 2);

    // Height deformation for rolling hills
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      // Gentle natural rolling hills
      const distFromCenter = Math.sqrt(vx * vx + vz * vz);
      if (distFromCenter > 400) {
        const hill = Math.sin(vx * 0.003) * Math.cos(vz * 0.003) * 45 + Math.sin(vx * 0.008) * 18;
        pos.setY(i, Math.max(0, hill) - 2);
      } else {
        pos.setY(i, -0.2);
      }
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: this.def.groundColor || 0x335528,
      roughness: 0.95,
      metalness: 0.05
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    this.group.add(terrainMesh);

    // Add 3D Trees along perimeter
    const treeGeo = new THREE.ConeGeometry(4, 14, 6);
    const trunkGeo = new THREE.CylinderGeometry(0.8, 1.0, 4, 6);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1b4317, roughness: 0.8 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e16, roughness: 0.9 });

    for (let i = 0; i < 220; i++) {
      const angle = (i / 220) * Math.PI * 2;
      const rad = 350 + Math.random() * 450;
      const x = Math.cos(angle) * rad;
      const z = Math.sin(angle) * rad;

      const tree = new THREE.Group();
      tree.position.set(x, 0, z);

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 2;
      tree.add(trunk);

      const foliage = new THREE.Mesh(treeGeo, foliageMat);
      foliage.position.y = 9;
      tree.add(foliage);

      const scale = 0.8 + Math.random() * 0.6;
      tree.scale.set(scale, scale, scale);
      this.group.add(tree);
    }
  }

  buildStartGantry() {
    // Starting grid and Overhead digital gantry at index 0 (Start/Finish)
    const s0 = this.samples[0];
    const gantry = new THREE.Group();
    gantry.position.copy(s0.point);

    const fwd = s0.tangent;
    const up = new THREE.Vector3(0, 1, 0);
    const right = s0.binormal;

    // Checkered line across track
    const checkTex = this.createCheckeredTexture();
    const checkMat = new THREE.MeshBasicMaterial({ map: checkTex });
    const checkGeo = new THREE.PlaneGeometry(this.roadWidth, 1.8);
    checkGeo.rotateX(-Math.PI / 2);
    const checkMesh = new THREE.Mesh(checkGeo, checkMat);
    checkMesh.position.y = 0.02;
    checkMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), fwd);
    this.group.add(checkMesh);

    // Starting Gantry Tower Pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.3 });
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.9, roughness: 0.2 });

    const spanW = this.roadWidth + 8;
    const gantryHeight = 7.5;

    // Left Pillar
    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, gantryHeight, 0.8), pillarMat);
    leftPillar.position.copy(s0.point).addScaledVector(right, -spanW * 0.5).add(new THREE.Vector3(0, gantryHeight * 0.5, 0));
    this.group.add(leftPillar);

    // Right Pillar
    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, gantryHeight, 0.8), pillarMat);
    rightPillar.position.copy(s0.point).addScaledVector(right, spanW * 0.5).add(new THREE.Vector3(0, gantryHeight * 0.5, 0));
    this.group.add(rightPillar);

    // Cross Beam
    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(spanW, 1.2, 1.4), beamMat);
    crossBeam.position.copy(s0.point).add(new THREE.Vector3(0, gantryHeight, 0));
    crossBeam.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), right);
    this.group.add(crossBeam);

    // 5 Official MotoGP Red Starting Lights
    this.startLights = [];
    const lightHousingGeo = new THREE.BoxGeometry(4.0, 0.9, 0.3);
    const housingMat = new THREE.MeshStandardMaterial({ color: 0x050505 });
    const housing = new THREE.Mesh(lightHousingGeo, housingMat);
    housing.position.copy(s0.point).add(new THREE.Vector3(0, gantryHeight - 0.2, 0)).addScaledVector(fwd, -0.8);
    housing.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), right);
    this.group.add(housing);

    const lightGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16);
    lightGeo.rotateX(Math.PI / 2);

    for (let i = 0; i < 5; i++) {
      const offX = (i - 2) * 0.72;
      const offPos = housing.position.clone().addScaledVector(right, offX).addScaledVector(fwd, -0.16);

      const lightOffMat = new THREE.MeshBasicMaterial({ color: 0x220000 });
      const lightMesh = new THREE.Mesh(lightGeo, lightOffMat);
      lightMesh.position.copy(offPos);
      lightMesh.quaternion.copy(housing.quaternion);
      this.group.add(lightMesh);

      this.startLights.push({
        mesh: lightMesh,
        on: false,
        setOn(active) {
          this.on = active;
          this.mesh.material.color.setHex(active ? 0xff0000 : 0x220000);
        }
      });
    }

    // Sponsor Banner on Gantry
    const bannerTex = this.createSponsorBannerTexture('MOTOGP GRAND PRIX DE FRANCE');
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex });
    const bannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(spanW - 2, 1.0), bannerMat);
    bannerMesh.position.copy(s0.point).add(new THREE.Vector3(0, gantryHeight + 0.9, 0)).addScaledVector(fwd, -0.7);
    bannerMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), fwd.clone().negate());
    this.group.add(bannerMesh);
  }

  setStartLightsCount(count) {
    // count = 0 to 5 active red lights
    for (let i = 0; i < 5; i++) {
      if (this.startLights[i]) {
        this.startLights[i].setOn(i < count);
      }
    }
  }

  createCheckeredTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const size = 16;
    for (let x = 0; x < canvas.width; x += size) {
      for (let y = 0; y < canvas.height; y += size) {
        ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#ffffff' : '#111111';
        ctx.fillRect(x, y, size, size);
      }
    }
    return new THREE.CanvasTexture(canvas);
  }

  createSponsorBannerTexture(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#d50000');
    grad.addColorStop(0.5, '#111111');
    grad.addColorStop(1, '#d50000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    return new THREE.CanvasTexture(canvas);
  }

  buildGrandstands() {
    // Grandstand along start straight and around key turns
    const standLocations = [0.03, 0.08, 0.28, 0.65, 0.88];
    const standMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.6 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.4 });
    const crowdMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.8 });

    standLocations.forEach(u => {
      const sample = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u).normalize();
      const normal = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      const stand = new THREE.Group();
      const standPos = sample.clone().addScaledVector(right, (this.roadWidth * 0.5 + 16));
      stand.position.copy(standPos);

      // Bleachers steps
      for (let step = 0; step < 6; step++) {
        const stepGeo = new THREE.BoxGeometry(45, 1.2, 3.5);
        const stepMesh = new THREE.Mesh(stepGeo, standMat);
        stepMesh.position.set(0, step * 1.2 + 0.6, step * 2.8);
        stand.add(stepMesh);

        // Crowd on steps (colorful randomized spectator blocks)
        const crowdGeo = new THREE.BoxGeometry(42, 1.4, 2.2);
        const crowdMesh = new THREE.Mesh(crowdGeo, crowdMat);
        crowdMesh.position.set(0, step * 1.2 + 1.8, step * 2.8);
        stand.add(crowdMesh);
      }

      // Roof Canopy
      const roofGeo = new THREE.BoxGeometry(48, 0.6, 22);
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.set(0, 10.5, 9);
      roofMesh.rotation.x = 0.15;
      stand.add(roofMesh);

      // Rotate to face track
      stand.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent);
      this.group.add(stand);
    });
  }

  buildBrakeMarkers() {
    // 300m, 200m, 100m, 50m distance boards before heavy braking zones
    const brakingDistances = [0.18, 0.48, 0.74];
    const boardMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    brakingDistances.forEach(u => {
      [300, 200, 100, 50].forEach((dist, idx) => {
        const boardU = (u - (dist / this.totalLength) + 1.0) % 1.0;
        const pt = this.curve.getPointAt(boardU);
        const tangent = this.curve.getTangentAt(boardU).normalize();
        const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

        const boardCanvas = document.createElement('canvas');
        boardCanvas.width = 128;
        boardCanvas.height = 128;
        const bCtx = boardCanvas.getContext('2d');
        bCtx.fillStyle = '#ffffff';
        bCtx.fillRect(0, 0, 128, 128);
        bCtx.strokeStyle = '#000000';
        bCtx.lineWidth = 10;
        bCtx.strokeRect(5, 5, 118, 118);
        bCtx.fillStyle = '#000000';
        bCtx.font = 'bold 58px Arial, sans-serif';
        bCtx.textAlign = 'center';
        bCtx.textBaseline = 'middle';
        bCtx.fillText(dist.toString(), 64, 64);

        const tex = new THREE.CanvasTexture(boardCanvas);
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: tex }));
        mesh.position.copy(pt).addScaledVector(right, (this.roadWidth * 0.5 + 4.5)).add(new THREE.Vector3(0, 1.4, 0));
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent.clone().negate());
        this.group.add(mesh);
      });
    });
  }

  buildSponsorBridges() {
    // Overhead sponsor bridges across the track
    const bridgeLocations = [
      { u: 0.22, sponsor: 'MICHELIN' },
      { u: 0.52, sponsor: 'BREMBO' },
      { u: 0.78, sponsor: 'MOTUL RACING' }
    ];

    bridgeLocations.forEach(item => {
      const pt = this.curve.getPointAt(item.u);
      const tangent = this.curve.getTangentAt(item.u).normalize();
      const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

      const spanW = this.roadWidth + 10;
      const bridgeH = 8.5;

      const g = new THREE.Group();
      g.position.copy(pt);

      const archGeo = new THREE.BoxGeometry(spanW, 2.2, 3.5);
      const archMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.7 });
      const arch = new THREE.Mesh(archGeo, archMat);
      arch.position.y = bridgeH;
      g.add(arch);

      // Sponsor Text
      const tex = this.createSponsorBannerTexture(item.sponsor);
      const bannerGeo = new THREE.PlaneGeometry(spanW - 2, 1.8);
      const bannerFront = new THREE.Mesh(bannerGeo, new THREE.MeshBasicMaterial({ map: tex }));
      bannerFront.position.set(0, bridgeH, -1.8);
      bannerFront.rotation.y = Math.PI;
      g.add(bannerFront);

      const bannerBack = new THREE.Mesh(bannerGeo, new THREE.MeshBasicMaterial({ map: tex }));
      bannerBack.position.set(0, bridgeH, 1.8);
      g.add(bannerBack);

      g.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), right);
      this.group.add(g);
    });
  }

  buildRainSystem() {
    // Rain particle system for Wet race
    const rainCount = 4000;
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = Math.random() * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x99bbdd,
      size: 0.22,
      transparent: true,
      opacity: 0.75
    });
    this.rainPoints = new THREE.Points(rainGeo, rainMat);
    this.group.add(this.rainPoints);
  }

  updateRain(playerPos) {
    if (!this.rainPoints) return;
    const pos = this.rainPoints.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] -= 2.2; // Fall down rapidly
      if (pos[i + 1] < 0) {
        pos[i + 1] = 60 + Math.random() * 20;
        pos[i + 0] = playerPos.x + (Math.random() - 0.5) * 180;
        pos[i + 2] = playerPos.z + (Math.random() - 0.5) * 180;
      }
    }
    this.rainPoints.geometry.attributes.position.needsUpdate = true;
  }

  // Quick projection of 3D point onto track spline
  projectPoint(worldPos) {
    // Find closest sample index
    let minDistSq = Infinity;
    let bestIdx = 0;
    const n = this.samples.length;

    for (let i = 0; i < n; i++) {
      const dSq = worldPos.distanceToSquared(this.samples[i].point);
      if (dSq < minDistSq) {
        minDistSq = dSq;
        bestIdx = i;
      }
    }

    const s = this.samples[bestIdx];
    const diff = new THREE.Vector3().subVectors(worldPos, s.point);
    const lateralOffset = diff.dot(s.binormal);
    const forwardOffset = diff.dot(s.tangent);
    const distOnTrack = (s.dist + forwardOffset + this.totalLength) % this.totalLength;
    const u = distOnTrack / this.totalLength;

    // Surface detection
    const absLat = Math.abs(lateralOffset);
    let surface = 'tarmac';
    const halfW = this.roadWidth * 0.5;

    if (absLat < halfW) {
      surface = 'tarmac';
    } else if (absLat < halfW + this.curbWidth) {
      surface = 'curb';
    } else if (absLat < halfW + this.curbWidth + this.runoffWidth) {
      surface = 'runoff';
    } else if (absLat < halfW + this.curbWidth + this.gravelWidth) {
      surface = 'gravel';
    } else {
      surface = 'barrier';
    }

    // Determine Sector (S1: 0-0.33, S2: 0.33-0.66, S3: 0.66-1.0)
    let sector = 1;
    if (u > 0.66) sector = 3;
    else if (u > 0.33) sector = 2;

    return {
      u,
      distOnTrack,
      lateralOffset,
      surface,
      sector,
      centerPoint: s.point,
      tangent: s.tangent,
      binormal: s.binormal,
      curvature: s.curvature,
      trackElevation: s.point.y
    };
  }

  // Target racing line speed based on curvature (used for AI and Racing Line HUD guide)
  getIdealSpeedKmh(u) {
    const idx = Math.floor(u * this.numSamples) % this.numSamples;
    const c = this.samples[idx].curvature;
    if (c < 0.2) return 350; // Straight
    if (c < 0.5) return 260; // Fast sweeper
    if (c < 0.9) return 180; // Medium corner
    if (c < 1.4) return 130; // Chicanes
    return 95; // Hairpin
  }
}

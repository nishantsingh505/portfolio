'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CONFIG = {
  particles: {
    count: typeof window !== 'undefined' && window.innerWidth < 768 ? 60 : 150,
    radius: 14,
    connectionDistance: 2.8,
    mouseInfluence: 0.0008,
    baseSize: 2.8,
    colors: [
      new THREE.Color(0x0284c7), // Sky Azure
      new THREE.Color(0x6366f1), // Royal Indigo
      new THREE.Color(0x059669), // Emerald
      new THREE.Color(0x7c3aed), // Violet
    ],
  },
  shapes: {
    count: typeof window !== 'undefined' && window.innerWidth < 768 ? 3 : 6,
  },
  dataLines: {
    count: typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 8,
    speed: 0.003,
  },
  camera: {
    fov: 60,
    near: 0.1,
    far: 100,
    positionZ: 20,
  },
};

export default function ThreeScene() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    scrollProgress: 0,
    frameCount: 0,
    animationId: null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const state = stateRef.current;
    let scene, camera, renderer, startTime;
    let particleSystem, particlePositions, particleVelocities;
    let connectionLines;
    let geometricShapes = [];
    let dataFlowLines = [];

    // ── Init Scene ──
    scene = new THREE.Scene();
    const isLightInitial = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';
    scene.fog = new THREE.FogExp2(isLightInitial ? 0xf8fafc : 0x090d16, 0.012);

    const themeObserver = new MutationObserver(() => {
      if (scene && scene.fog) {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        scene.fog.color.setHex(isLight ? 0xf8fafc : 0x090d16);
      }
    });
    if (typeof document !== 'undefined') {
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    camera = new THREE.PerspectiveCamera(
      CONFIG.camera.fov,
      window.innerWidth / window.innerHeight,
      CONFIG.camera.near,
      CONFIG.camera.far
    );
    camera.position.set(0, 0, CONFIG.camera.positionZ);

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    startTime = performance.now();

    // ── Ambient Lights ──
    scene.add(new THREE.AmbientLight(0x06b6d4, 0.15));
    const p1 = new THREE.PointLight(0x06b6d4, 0.6, 30);
    p1.position.set(-8, 5, 10);
    scene.add(p1);
    const p2 = new THREE.PointLight(0x8b5cf6, 0.4, 30);
    p2.position.set(8, -3, 8);
    scene.add(p2);
    const p3 = new THREE.PointLight(0xec4899, 0.2, 25);
    p3.position.set(0, 8, 5);
    scene.add(p3);

    // ── Create Particles ──
    const count = CONFIG.particles.count;
    const geometry = new THREE.BufferGeometry();
    particlePositions = new Float32Array(count * 3);
    particleVelocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = CONFIG.particles.radius * Math.cbrt(Math.random());

      particlePositions[i3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i3 + 2] = r * Math.cos(phi);

      particleVelocities[i3] = (Math.random() - 0.5) * 0.008;
      particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.008;
      particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.005;

      const color =
        CONFIG.particles.colors[
          Math.floor(Math.random() * CONFIG.particles.colors.length)
        ];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = CONFIG.particles.baseSize * (0.5 + Math.random() * 1.0);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const vertexShader = `
      attribute float size;
      varying vec3 vColor;
      varying float vOpacity;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float dist = length(mvPosition.xyz);
        vOpacity = clamp(1.0 - dist / 35.0, 0.15, 1.0);
        gl_PointSize = size * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      varying float vOpacity;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.1, d) * vOpacity;
        float glow = exp(-d * 4.0) * 0.6;
        gl_FragColor = vec4(vColor + glow, alpha * 0.85);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // ── Connection Lines ──
    const maxConnections = count * 3;
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    const lineColors = new Float32Array(maxConnections * 2 * 3);

    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    lineGeo.setDrawRange(0, 0);

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    connectionLines = new THREE.LineSegments(lineGeo, lineMaterial);
    scene.add(connectionLines);

    // ── Geometric Shapes ──
    const shapeDefs = [
      {
        geo: new THREE.IcosahedronGeometry(1.8, 1),
        pos: [-9, 3, -5],
        rot: { x: 0.003, y: 0.005, z: 0.002 },
        color: 0x06b6d4,
        scale: 1.0,
      },
      {
        geo: new THREE.TorusKnotGeometry(1.2, 0.3, 80, 12, 2, 3),
        pos: [10, -2, -6],
        rot: { x: 0.004, y: 0.002, z: 0.003 },
        color: 0x8b5cf6,
        scale: 0.9,
      },
      {
        geo: new THREE.OctahedronGeometry(0.8, 0),
        pos: [-6, -5, -3],
        rot: { x: 0.006, y: 0.004, z: 0.005 },
        color: 0xec4899,
        scale: 0.7,
      },
      {
        geo: new THREE.TetrahedronGeometry(0.9, 0),
        pos: [7, 5, -4],
        rot: { x: 0.005, y: 0.003, z: 0.006 },
        color: 0x10b981,
        scale: 0.8,
      },
      {
        geo: new THREE.DodecahedronGeometry(1.0, 0),
        pos: [-3, 7, -7],
        rot: { x: 0.002, y: 0.006, z: 0.003 },
        color: 0x06b6d4,
        scale: 0.6,
      },
      {
        geo: new THREE.IcosahedronGeometry(0.6, 0),
        pos: [5, -6, -4],
        rot: { x: 0.007, y: 0.003, z: 0.004 },
        color: 0x8b5cf6,
        scale: 0.5,
      },
    ];

    const toCreate = shapeDefs.slice(0, CONFIG.shapes.count);
    const shapeGeometries = [];
    const shapeMaterials = [];

    toCreate.forEach((def) => {
      const edges = new THREE.EdgesGeometry(def.geo);
      const wireMat = new THREE.LineBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.NormalBlending,
      });
      const wireframe = new THREE.LineSegments(edges, wireMat);

      const solidMat = new THREE.MeshBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: 0.04,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
      });
      const solid = new THREE.Mesh(def.geo, solidMat);

      const group = new THREE.Group();
      group.add(wireframe);
      group.add(solid);
      group.position.set(...def.pos);
      group.scale.setScalar(def.scale);

      group.userData = {
        rotSpeed: def.rot,
        basePos: new THREE.Vector3(...def.pos),
        baseScale: def.scale,
        floatOff: Math.random() * Math.PI * 2,
        floatSpd: 0.5 + Math.random() * 0.5,
        floatAmp: 0.3 + Math.random() * 0.4,
      };

      scene.add(group);
      geometricShapes.push(group);
      shapeGeometries.push(def.geo, edges);
      shapeMaterials.push(wireMat, solidMat);
    });

    // ── Data Flow Lines ──
    const dataLineGeometries = [];
    const dataLineMaterials = [];

    for (let i = 0; i < CONFIG.dataLines.count; i++) {
      const points = [];
      const startAngle = (i / CONFIG.dataLines.count) * Math.PI * 2;
      const radius = 8 + Math.random() * 6;
      const segments = 60;

      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const angle = startAngle + t * Math.PI * (1.5 + Math.random());
        const r = radius * (1 - t * 0.3);
        const y = (t - 0.5) * 10 + (Math.random() - 0.5) * 2;
        points.push(new THREE.Vector3(r * Math.cos(angle), y, r * Math.sin(angle) - 10));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const curvePoints = curve.getPoints(120);
      const dlGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);

      const dlMat = new THREE.LineDashedMaterial({
        color: CONFIG.particles.colors[i % CONFIG.particles.colors.length],
        transparent: true,
        opacity: 0.16,
        dashSize: 0.8,
        gapSize: 1.5,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });

      const line = new THREE.Line(dlGeo, dlMat);
      line.computeLineDistances();

      line.userData = {
        dashOffset: 0,
        speed: CONFIG.dataLines.speed * (0.5 + Math.random()),
        baseOpacity: 0.08 + Math.random() * 0.08,
      };

      scene.add(line);
      dataFlowLines.push(line);
      dataLineGeometries.push(dlGeo);
      dataLineMaterials.push(dlMat);
    }

    // ── Update Functions ──
    function updateConnections() {
      const maxDist = CONFIG.particles.connectionDistance;
      const positions = connectionLines.geometry.attributes.position.array;
      const clrs = connectionLines.geometry.attributes.color.array;
      let vertexIndex = 0;
      const maxVerts = count * 3;
      const maxDistSq = maxDist * maxDist;

      for (let i = 0; i < count && vertexIndex < maxVerts; i++) {
        const ix = particlePositions[i * 3];
        const iy = particlePositions[i * 3 + 1];
        const iz = particlePositions[i * 3 + 2];

        for (let j = i + 1; j < count && vertexIndex < maxVerts; j++) {
          const jx = particlePositions[j * 3];
          const jy = particlePositions[j * 3 + 1];
          const jz = particlePositions[j * 3 + 2];

          const dx = ix - jx;
          const dy = iy - jy;
          const dz = iz - jz;
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < maxDistSq) {
            const alpha = 1.0 - Math.sqrt(distSq) / maxDist;
            const vi = vertexIndex * 6;

            positions[vi] = ix;
            positions[vi + 1] = iy;
            positions[vi + 2] = iz;
            positions[vi + 3] = jx;
            positions[vi + 4] = jy;
            positions[vi + 5] = jz;

            clrs[vi] = 0.024 * alpha + 0.02;
            clrs[vi + 1] = 0.714 * alpha;
            clrs[vi + 2] = 0.831 * alpha;
            clrs[vi + 3] = 0.545 * alpha;
            clrs[vi + 4] = 0.361 * alpha;
            clrs[vi + 5] = 0.965 * alpha;

            vertexIndex++;
          }
        }
      }

      connectionLines.geometry.setDrawRange(0, vertexIndex * 2);
      connectionLines.geometry.attributes.position.needsUpdate = true;
      connectionLines.geometry.attributes.color.needsUpdate = true;
    }

    function updateParticles(elapsed) {
      const radius = CONFIG.particles.radius;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        particlePositions[i3] += particleVelocities[i3];
        particlePositions[i3 + 1] += particleVelocities[i3 + 1];
        particlePositions[i3 + 2] += particleVelocities[i3 + 2];

        const dx = state.mouse.x * 15 - particlePositions[i3];
        const dy = -state.mouse.y * 10 - particlePositions[i3 + 1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 8) {
          const force = CONFIG.particles.mouseInfluence * (1 - dist / 8);
          particleVelocities[i3] += dx * force;
          particleVelocities[i3 + 1] += dy * force;
        }

        const px = particlePositions[i3];
        const py = particlePositions[i3 + 1];
        const pz = particlePositions[i3 + 2];
        const distCenter = Math.sqrt(px * px + py * py + pz * pz);
        if (distCenter > radius) {
          particleVelocities[i3] -= px * 0.001;
          particleVelocities[i3 + 1] -= py * 0.001;
          particleVelocities[i3 + 2] -= pz * 0.001;
        }

        particleVelocities[i3] *= 0.998;
        particleVelocities[i3 + 1] *= 0.998;
        particleVelocities[i3 + 2] *= 0.998;

        particlePositions[i3 + 1] += Math.sin(elapsed * 0.3 + i * 0.1) * 0.002;
      }

      particleSystem.rotation.y = elapsed * 0.05 + state.scrollProgress * 0.3;
      particleSystem.rotation.x = Math.sin(elapsed * 0.02) * 0.1;
      particleSystem.scale.setScalar(1 + state.scrollProgress * 0.075);
      particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    function updateShapes(elapsed) {
      geometricShapes.forEach((shape, i) => {
        const ud = shape.userData;

        shape.rotation.x += ud.rotSpeed.x * (1 + state.scrollProgress * 0.5);
        shape.rotation.y += ud.rotSpeed.y * (1 + state.scrollProgress * 0.5);
        shape.rotation.z += ud.rotSpeed.z * (1 + state.scrollProgress * 0.3);

        // Float animation
        const floatY = Math.sin(elapsed * ud.floatSpd + ud.floatOff) * ud.floatAmp;
        const floatX = Math.cos(elapsed * ud.floatSpd * 0.7 + ud.floatOff) * ud.floatAmp * 0.5;
        shape.position.x = ud.basePos.x + floatX + state.mouse.x * 0.5 * (i % 2 === 0 ? 1 : -1);
        shape.position.y = ud.basePos.y + floatY + state.mouse.y * 0.3 * (i % 2 === 0 ? -1 : 1);

        // Scroll-based opacity
        shape.children.forEach((child) => {
          if (child.material && child instanceof THREE.LineSegments) {
            child.material.opacity = 0.25 + state.scrollProgress * 0.1;
          }
        });
      });
    }

    function updateDataFlowLines(elapsed) {
      dataFlowLines.forEach((line, i) => {
        line.userData.dashOffset -= line.userData.speed;
        line.material.dashOffset = line.userData.dashOffset;
        line.material.opacity = line.userData.baseOpacity + Math.sin(elapsed + i) * 0.03;
        line.rotation.y = elapsed * 0.02 * (i % 2 === 0 ? 1 : -1);
      });
    }

    function updateCamera(elapsed) {
      const targetZ = CONFIG.camera.positionZ + state.scrollProgress * 5;
      camera.position.z += (targetZ - camera.position.z) * 0.03;

      const targetX = state.mouse.x * 1.5;
      const targetY = state.mouse.y * 0.8;
      camera.position.x += (targetX - camera.position.x) * 0.02;
      camera.position.y += (targetY - camera.position.y) * 0.02;

      camera.position.x += Math.sin(elapsed * 0.15) * 0.02;
      camera.position.y += Math.cos(elapsed * 0.12) * 0.015;
      camera.lookAt(0, 0, 0);
    }

    // ── Animation Loop ──
    function animate() {
      state.animationId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;

      state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.12;
      state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.12;

      updateParticles(elapsed);
      state.frameCount++;
      if (state.frameCount % 3 === 0) updateConnections();
      updateShapes(elapsed);
      updateDataFlowLines(elapsed);
      updateCamera(elapsed);

      renderer.render(scene, camera);
    }

    // ── Events ──
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onMouseMove(e) {
      state.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      state.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    function onScroll() {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      state.scrollProgress =
        maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
    }

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll);

    animate();

    return () => {
      themeObserver.disconnect();
      cancelAnimationFrame(state.animationId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      lineGeo.dispose();
      lineMaterial.dispose();
      shapeGeometries.forEach((g) => g.dispose());
      shapeMaterials.forEach((m) => m.dispose());
      dataLineGeometries.forEach((g) => g.dispose());
      dataLineMaterials.forEach((m) => m.dispose());
    };
  }, []);

  return <canvas id="three-canvas" ref={canvasRef} />;
}

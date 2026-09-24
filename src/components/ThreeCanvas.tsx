import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { SectionId } from '../types';
import { sounds } from '../utils/audio';

interface ThreeCanvasProps {
  activeSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  onCameraTransitionComplete: (section: SectionId) => void;
  onHoverObject: (section: SectionId | null, name: string | null) => void;
  isTransitioning: boolean;
  setIsTransitioning: (val: boolean) => void;
}

// Camera framing configurations for each section
const CAMERA_PRESETS: Record<SectionId, { cam: { x: number; y: number; z: number }; target: { x: number; y: number; z: number } }> = {
  overview: {
    cam: { x: 3.3, y: 3.6, z: 3.6 },
    target: { x: 0, y: 0.45, z: 0 },
  },
  projects: {
    cam: { x: 0.05, y: 1.45, z: 1.55 },
    target: { x: -0.15, y: 0.72, z: 0.05 },
  },
  about: {
    cam: { x: 1.85, y: 1.7, z: 1.45 },
    target: { x: 1.25, y: 0.65, z: -0.4 },
  },
  contact: {
    cam: { x: -1.45, y: 1.45, z: 1.6 },
    target: { x: -0.95, y: 0.58, z: 0.3 },
  },
};

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  activeSection,
  onSelectSection,
  onCameraTransitionComplete,
  onHoverObject,
  isTransitioning,
  setIsTransitioning,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number>(0);

  // References for dynamic objects and camera choreography
  const currentTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.45, 0));
  const currentBaseCamRef = useRef<THREE.Vector3>(new THREE.Vector3(5.2, 5.8, 5.4));
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  const interactiveObjectsRef = useRef<THREE.Group[]>([]);
  const steamParticlesRef = useRef<THREE.Points | null>(null);
  const hoveredGroupRef = useRef<THREE.Group | null>(null);
  const lampLightRef = useRef<THREE.SpotLight | null>(null);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);

  // Store activeSection in ref for access inside event handlers and render loop
  const activeSectionRef = useRef<SectionId>(activeSection);
  activeSectionRef.current = activeSection;

  const isTransitioningRef = useRef<boolean>(isTransitioning);
  isTransitioningRef.current = isTransitioning;

  // ---------------------------------------------------------------------------
  // 1. PROCEDURAL SCREEN TEXTURE
  // Creates a clean, stylized code IDE texture on the laptop display
  // ---------------------------------------------------------------------------
  const createScreenCanvas = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // IDE Dark Canvas
    ctx.fillStyle = '#0f1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Editor Header Bar
    ctx.fillStyle = '#181b24';
    ctx.fillRect(0, 0, canvas.width, 56);

    // macOS Style Window dots
    const dots = ['#ff5f56', '#ffbd2e', '#27c93f'];
    dots.forEach((color, i) => {
      ctx.beginPath();
      ctx.arc(36 + i * 26, 28, 7, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    // Active File Tab
    ctx.fillStyle = '#222634';
    ctx.fillRect(130, 10, 220, 46);
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('Workspace.tsx', 156, 38);

    // Sidebar line
    ctx.fillStyle = '#1c202d';
    ctx.fillRect(0, 56, 70, canvas.height - 56);

    // Line numbers & Code Syntax Blocks
    const lines = [
      { num: '01', text: 'import { SpatialEngine } from "@three/atelier";', color: '#c084fc' },
      { num: '02', text: 'import { Experience } from "./portfolio";', color: '#93c5fd' },
      { num: '03', text: '', color: '#fff' },
      { num: '04', text: 'export const Portfolio = () => {', color: '#f59e0b' },
      { num: '05', text: '  const projects = useProjects("featured");', color: '#38bdf8' },
      { num: '06', text: '  const status = "Crafting high-fidelity 3D web";', color: '#34d399' },
      { num: '07', text: '', color: '#fff' },
      { num: '08', text: '  // Click any object on desk to explore', color: '#64748b' },
      { num: '09', text: '  return <Workspace camera="cinematic" />;', color: '#f472b6' },
      { num: '10', text: '};', color: '#f59e0b' },
      { num: '11', text: '', color: '#fff' },
      { num: '12', text: 'export default Portfolio;', color: '#c084fc' },
    ];

    ctx.font = '22px "JetBrains Mono", monospace';
    lines.forEach((line, index) => {
      const y = 110 + index * 40;
      ctx.fillStyle = '#475569';
      ctx.fillText(line.num, 90, y);
      ctx.fillStyle = line.color;
      ctx.fillText(line.text, 140, y);
    });

    // Subtle pulsing cursor
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(490, 415, 12, 26);

    return canvas;
  }, []);

  // ---------------------------------------------------------------------------
  // 2. SCENE SETUP & GEOMETRY CREATION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- Scene & Background Fog ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x121316);
    scene.fog = new THREE.FogExp2(0x121316, 0.08);

    // --- Camera Setup ---
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    // Start at cinematic zoomed-out position for page load intro
    camera.position.set(5.2, 5.8, 5.4);
    camera.lookAt(0, 0.45, 0);
    cameraRef.current = camera;

    // --- Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- Lighting Setup ---
    // 1. Soft Warm Ambient Light for overall visibility
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.85);
    scene.add(ambientLight);

    // 2. Main Key Directional Light (Soft daylight/studio rim)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    keyLight.position.set(5, 7, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // 3. Desk Lamp Warm Key Light (Cozy atmosphere & mood)
    const lampSpot = new THREE.SpotLight(0xffb259, 3.2, 7, Math.PI / 3.8, 0.45, 1.2);
    lampSpot.position.set(-1.6, 2.3, -0.6);
    lampSpot.target.position.set(-0.6, 0.3, 0.2);
    lampSpot.castShadow = true;
    lampSpot.shadow.bias = -0.001;
    scene.add(lampSpot);
    scene.add(lampSpot.target);
    lampLightRef.current = lampSpot;

    // 4. Fill Light (Cool subtle fill from opposite side)
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.45);
    fillLight.position.set(-4, 3, 2);
    scene.add(fillLight);

    // --- Common Materials (Low-poly & PBR soft-shaded) ---
    const woodDeskMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3425,
      roughness: 0.65,
      metalness: 0.05,
    });

    const deskMatMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e2026,
      roughness: 0.85,
      metalness: 0.02,
    });

    const metalLegMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.4,
      metalness: 0.7,
    });

    // -------------------------------------------------------------------------
    // 3. OBJECT: THE DESK WORKSPACE
    // -------------------------------------------------------------------------
    const deskGroup = new THREE.Group();

    // Tabletop
    const deskTopGeo = new THREE.BoxGeometry(4.2, 0.12, 2.5);
    const deskTop = new THREE.Mesh(deskTopGeo, woodDeskMaterial);
    deskTop.position.set(0, 0, 0);
    deskTop.receiveShadow = true;
    deskTop.castShadow = true;
    deskGroup.add(deskTop);

    // Desk Edge Bevel/Trim
    const deskBevelGeo = new THREE.BoxGeometry(4.24, 0.04, 2.54);
    const deskBevelMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.8 });
    const deskBevel = new THREE.Mesh(deskBevelGeo, deskBevelMat);
    deskBevel.position.set(0, -0.04, 0);
    deskGroup.add(deskBevel);

    // Large Minimalist Desk Mat
    const matGeo = new THREE.BoxGeometry(2.6, 0.015, 1.4);
    const deskMat = new THREE.Mesh(matGeo, deskMatMaterial);
    deskMat.position.set(-0.2, 0.065, 0.15);
    deskMat.receiveShadow = true;
    deskGroup.add(deskMat);

    // Desk Legs (Sturdy clean modern architectural frame)
    const legGeo = new THREE.BoxGeometry(0.08, 1.6, 0.08);
    const legPositions: [number, number, number][] = [
      [-1.95, -0.86, -1.1],
      [1.95, -0.86, -1.1],
      [-1.95, -0.86, 1.1],
      [1.95, -0.86, 1.1],
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, metalLegMaterial);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      deskGroup.add(leg);
    });

    // Floor platform (Deep warm neutral plane)
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f1013,
      roughness: 0.9,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.66;
    floor.receiveShadow = true;
    scene.add(floor);

    scene.add(deskGroup);

    // -------------------------------------------------------------------------
    // 4. OBJECT: LAPTOP (Interactive -> "Projects")
    // -------------------------------------------------------------------------
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(-0.2, 0.07, 0.1);
    laptopGroup.userData = { sectionId: 'projects', name: 'MacBook Pro · Projects' };

    const laptopChassisMat = new THREE.MeshStandardMaterial({
      color: 0x363942,
      roughness: 0.35,
      metalness: 0.6,
    });

    const laptopDarkMat = new THREE.MeshStandardMaterial({
      color: 0x17191e,
      roughness: 0.6,
      metalness: 0.2,
    });

    // Base chassis
    const laptopBaseGeo = new THREE.BoxGeometry(1.1, 0.024, 0.74);
    const laptopBase = new THREE.Mesh(laptopBaseGeo, laptopChassisMat);
    laptopBase.castShadow = true;
    laptopBase.receiveShadow = true;
    laptopGroup.add(laptopBase);

    // Keyboard well & Keys
    const kbWellGeo = new THREE.BoxGeometry(0.96, 0.005, 0.38);
    const kbWell = new THREE.Mesh(kbWellGeo, laptopDarkMat);
    kbWell.position.set(0, 0.013, -0.1);
    laptopGroup.add(kbWell);

    // Trackpad
    const trackpadGeo = new THREE.BoxGeometry(0.36, 0.003, 0.22);
    const trackpadMat = new THREE.MeshStandardMaterial({ color: 0x2a2d34, roughness: 0.4, metalness: 0.5 });
    const trackpad = new THREE.Mesh(trackpadGeo, trackpadMat);
    trackpad.position.set(0, 0.013, 0.21);
    laptopGroup.add(trackpad);

    // Screen Hinge & Display (Open at ~108 degrees)
    const screenPivot = new THREE.Group();
    screenPivot.position.set(0, 0.012, -0.37);
    screenPivot.rotation.x = -Math.PI * 0.12; // tilted back

    // Screen back cover / bezel
    const screenFrameGeo = new THREE.BoxGeometry(1.1, 0.72, 0.02);
    const screenFrame = new THREE.Mesh(screenFrameGeo, laptopChassisMat);
    screenFrame.position.set(0, 0.36, 0);
    screenFrame.castShadow = true;
    screenPivot.add(screenFrame);

    // Glowing Emissive Display Screen
    const screenCanvas = createScreenCanvas();
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.anisotropy = 4;

    const screenGeo = new THREE.PlaneGeometry(1.02, 0.64);
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTexture,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.45,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0.36, 0.011);
    screenPivot.add(screenMesh);
    screenMeshRef.current = screenMesh;

    // Screen soft glow area light simulator
    const screenLight = new THREE.PointLight(0x60a5fa, 0.6, 1.8);
    screenLight.position.set(0, 0.4, 0.15);
    screenPivot.add(screenLight);

    laptopGroup.add(screenPivot);

    // Hitbox wrapper for easier clicking
    const laptopHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.85, 0.95),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    laptopHitbox.position.set(0, 0.4, -0.1);
    laptopGroup.add(laptopHitbox);

    scene.add(laptopGroup);

    // -------------------------------------------------------------------------
    // 5. OBJECT: POTTED PLANT (Interactive -> "About")
    // -------------------------------------------------------------------------
    const plantGroup = new THREE.Group();
    plantGroup.position.set(1.3, 0.07, -0.4);
    plantGroup.userData = { sectionId: 'about', name: 'Monstera Plant · About Me' };

    // Ceramic Pot (faceted low-poly style)
    const potGeo = new THREE.CylinderGeometry(0.24, 0.16, 0.42, 10);
    const potMat = new THREE.MeshStandardMaterial({
      color: 0xd97757, // warm terracotta
      roughness: 0.8,
      metalness: 0.05,
      flatShading: true,
    });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.set(0, 0.21, 0);
    pot.castShadow = true;
    pot.receiveShadow = true;
    plantGroup.add(pot);

    // Dark Pot Soil
    const soilGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 10);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x221812, roughness: 0.95 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.set(0, 0.41, 0);
    plantGroup.add(soil);

    // Stylized Plant Leaves
    const leafMat1 = new THREE.MeshStandardMaterial({
      color: 0x2e6f40,
      roughness: 0.6,
      metalness: 0.05,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const leafMat2 = new THREE.MeshStandardMaterial({
      color: 0x3d8b54,
      roughness: 0.55,
      metalness: 0.05,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    const createLeaf = (scale: number, rotX: number, rotY: number, rotZ: number, posX: number, posY: number, posZ: number, mat: THREE.Material) => {
      const leafGeo = new THREE.ConeGeometry(0.12 * scale, 0.45 * scale, 5);
      leafGeo.scale(1, 1, 0.25);
      const leaf = new THREE.Mesh(leafGeo, mat);
      leaf.position.set(posX, posY, posZ);
      leaf.rotation.set(rotX, rotY, rotZ);
      leaf.castShadow = true;
      return leaf;
    };

    // Cluster of stylized foliage
    plantGroup.add(createLeaf(1.1, 0.4, 0.2, 0.5, 0.08, 0.55, 0.08, leafMat1));
    plantGroup.add(createLeaf(1.25, -0.4, 1.2, -0.45, -0.06, 0.6, -0.06, leafMat2));
    plantGroup.add(createLeaf(1.0, 0.5, -1.4, -0.35, -0.08, 0.54, 0.08, leafMat1));
    plantGroup.add(createLeaf(0.9, -0.2, -0.8, 0.55, 0.09, 0.52, -0.08, leafMat2));
    plantGroup.add(createLeaf(1.3, 0.1, 2.2, -0.2, 0.0, 0.68, 0.02, leafMat1));

    // Hitbox wrapper for plant
    const plantHitbox = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.3, 0.85, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    plantHitbox.position.set(0, 0.42, 0);
    plantGroup.add(plantHitbox);

    scene.add(plantGroup);

    // -------------------------------------------------------------------------
    // 6. OBJECT: COFFEE CUP WITH STEAM (Interactive -> "Contact")
    // -------------------------------------------------------------------------
    const cupGroup = new THREE.Group();
    cupGroup.position.set(-1.0, 0.07, 0.35);
    cupGroup.userData = { sectionId: 'contact', name: 'Hot Coffee · Get In Touch' };

    // Ceramic Mug
    const mugGeo = new THREE.CylinderGeometry(0.15, 0.13, 0.26, 16);
    const mugMat = new THREE.MeshStandardMaterial({
      color: 0xede8de, // warm off-white ceramic
      roughness: 0.35,
      metalness: 0.08,
    });
    const mug = new THREE.Mesh(mugGeo, mugMat);
    mug.position.set(0, 0.13, 0);
    mug.castShadow = true;
    mug.receiveShadow = true;
    cupGroup.add(mug);

    // Mug Handle
    const handleGeo = new THREE.TorusGeometry(0.08, 0.022, 8, 16, Math.PI);
    const handle = new THREE.Mesh(handleGeo, mugMat);
    handle.position.set(-0.15, 0.13, 0);
    handle.rotation.z = Math.PI / 2;
    handle.castShadow = true;
    cupGroup.add(handle);

    // Dark Roast Coffee Liquid
    const coffeeGeo = new THREE.CylinderGeometry(0.138, 0.138, 0.02, 16);
    const coffeeMat = new THREE.MeshStandardMaterial({
      color: 0x22130c,
      roughness: 0.15,
      metalness: 0.1,
    });
    const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
    coffee.position.set(0, 0.24, 0);
    cupGroup.add(coffee);

    // Animated Coffee Steam Particles
    const steamCount = 38;
    const steamGeo = new THREE.BufferGeometry();
    const steamPositions = new Float32Array(steamCount * 3);
    const steamOffsets = new Float32Array(steamCount);

    for (let i = 0; i < steamCount; i++) {
      steamPositions[i * 3] = (Math.random() - 0.5) * 0.12;
      steamPositions[i * 3 + 1] = 0.26 + Math.random() * 0.45;
      steamPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.12;
      steamOffsets[i] = Math.random() * Math.PI * 2;
    }

    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));

    // Particle sprite using canvas
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 32;
    particleCanvas.height = 32;
    const pCtx = particleCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      grad.addColorStop(0.4, 'rgba(240, 240, 240, 0.3)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTex = new THREE.CanvasTexture(particleCanvas);

    const steamMat = new THREE.PointsMaterial({
      size: 0.09,
      map: particleTex,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const steamParticles = new THREE.Points(steamGeo, steamMat);
    cupGroup.add(steamParticles);
    steamParticlesRef.current = steamParticles;

    // Hitbox wrapper for mug
    const cupHitbox = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.45, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    cupHitbox.position.set(0, 0.2, 0);
    cupGroup.add(cupHitbox);

    scene.add(cupGroup);

    // -------------------------------------------------------------------------
    // 7. DECORATIVE DESK ACCESSORIES (Lamp, Notebook, Pen, Speaker)
    // -------------------------------------------------------------------------
    // Modern Architect Desk Lamp
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-1.6, 0.07, -0.6);

    const lampBaseMat = new THREE.MeshStandardMaterial({ color: 0x1f242c, roughness: 0.4, metalness: 0.6 });
    const lampBrassMat = new THREE.MeshStandardMaterial({ color: 0xc89d55, roughness: 0.3, metalness: 0.8 });

    // Lamp Base
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.035, 16), lampBaseMat);
    lampBase.position.y = 0.02;
    lampBase.castShadow = true;
    lampGroup.add(lampBase);

    // Lamp Stem Lower
    const stem1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8), lampBaseMat);
    stem1.position.set(0, 0.45, 0);
    stem1.rotation.z = -0.22;
    stem1.castShadow = true;
    lampGroup.add(stem1);

    // Brass joint
    const joint = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), lampBrassMat);
    joint.position.set(0.1, 0.9, 0);
    lampGroup.add(joint);

    // Lamp Stem Upper
    const stem2 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.8, 8), lampBaseMat);
    stem2.position.set(0.35, 1.25, 0);
    stem2.rotation.z = 0.65;
    stem2.castShadow = true;
    lampGroup.add(stem2);

    // Lamp Shade Cone
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.28, 12, 1, true), lampBaseMat);
    shade.position.set(0.68, 1.5, 0);
    shade.rotation.z = -Math.PI / 3;
    shade.castShadow = true;
    lampGroup.add(shade);

    // Glowing Lamp Bulb
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffedd5 })
    );
    bulb.position.set(0.66, 1.48, 0);
    lampGroup.add(bulb);

    scene.add(lampGroup);

    // Designer Notebook with Brass Pen (beside plant)
    const notebookGroup = new THREE.Group();
    notebookGroup.position.set(1.15, 0.07, 0.35);
    notebookGroup.rotation.y = -0.15;

    const bookCoverMat = new THREE.MeshStandardMaterial({ color: 0x242e38, roughness: 0.8 });
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xf3ede2, roughness: 0.9 });
    const penMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.85 });

    const book = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.035, 0.68), bookCoverMat);
    book.position.y = 0.018;
    book.castShadow = true;
    notebookGroup.add(book);

    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.028, 0.65), paperMat);
    pages.position.set(0.01, 0.018, 0);
    notebookGroup.add(pages);

    // Brass Pen resting on notebook
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 8), penMat);
    pen.position.set(0.1, 0.045, 0);
    pen.rotation.x = Math.PI / 2;
    pen.rotation.z = 0.12;
    pen.castShadow = true;
    notebookGroup.add(pen);

    scene.add(notebookGroup);

    // Register interactive groups
    interactiveObjectsRef.current = [laptopGroup, plantGroup, cupGroup];

    // -------------------------------------------------------------------------
    // 8. CINEMATIC INTRO ON PAGE LOAD (2-3 second smooth ease-in-out)
    // -------------------------------------------------------------------------
    const defaultCam = CAMERA_PRESETS.overview.cam;
    const defaultTarget = CAMERA_PRESETS.overview.target;

    gsap.to(currentBaseCamRef.current, {
      x: defaultCam.x,
      y: defaultCam.y,
      z: defaultCam.z,
      duration: 2.6,
      ease: 'power2.inOut',
    });

    gsap.to(currentTargetRef.current, {
      x: defaultTarget.x,
      y: defaultTarget.y,
      z: defaultTarget.z,
      duration: 2.6,
      ease: 'power2.inOut',
      onComplete: () => {
        setIsTransitioning(false);
        onCameraTransitionComplete('overview');
      },
    });

    // -------------------------------------------------------------------------
    // 9. ANIMATION LOOP
    // -------------------------------------------------------------------------
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse parallax damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Apply camera parallax without exceeding guided boundaries
      if (cameraRef.current) {
        const cam = cameraRef.current;
        const base = currentBaseCamRef.current;
        const target = currentTargetRef.current;

        // Parallax offset scale (subtle 0.15 unit sway)
        const parallaxX = mouseRef.current.x * 0.18;
        const parallaxY = mouseRef.current.y * 0.12;

        cam.position.x = base.x + parallaxX;
        cam.position.y = base.y + parallaxY;
        cam.position.z = base.z;
        cam.lookAt(target.x, target.y, target.z);
      }

      // Animate Coffee Steam particles
      if (steamParticlesRef.current) {
        const positions = steamParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < steamCount; i++) {
          const idx = i * 3;
          // Float upward
          positions[idx + 1] += 0.0022;
          // Gentle sinusoidal sway
          positions[idx] += Math.sin(elapsedTime * 2 + steamOffsets[i]) * 0.0006;
          // Reset particle when it reaches top
          if (positions[idx + 1] > 0.72) {
            positions[idx + 1] = 0.26;
            positions[idx] = (Math.random() - 0.5) * 0.12;
            positions[idx + 2] = (Math.random() - 0.5) * 0.12;
          }
        }
        steamParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Gentle screen emissive pulse
      if (screenMeshRef.current) {
        const mat = screenMeshRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.42 + Math.sin(elapsedTime * 1.5) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    // -------------------------------------------------------------------------
    // 10. RESIZE & CLEANUP
    // -------------------------------------------------------------------------
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [createScreenCanvas, onCameraTransitionComplete, setIsTransitioning]);

  // ---------------------------------------------------------------------------
  // 11. CAMERA CHOREOGRAPHY & GSAP TRANSITION LOGIC
  // Smooth transition between sections (1.4–1.8s, easeInOutCubic / power2.inOut)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const preset = CAMERA_PRESETS[activeSection];
    if (!preset) return;

    setIsTransitioning(true);
    sounds.playTransit();

    // Kill any ongoing tweens on camera references
    gsap.killTweensOf(currentBaseCamRef.current);
    gsap.killTweensOf(currentTargetRef.current);

    // Eased camera transit
    gsap.to(currentBaseCamRef.current, {
      x: preset.cam.x,
      y: preset.cam.y,
      z: preset.cam.z,
      duration: 1.6,
      ease: 'power2.inOut',
    });

    gsap.to(currentTargetRef.current, {
      x: preset.target.x,
      y: preset.target.y,
      z: preset.target.z,
      duration: 1.6,
      ease: 'power2.inOut',
      onComplete: () => {
        setIsTransitioning(false);
        // Triggers UI overlay panel reveal AFTER camera completes
        onCameraTransitionComplete(activeSection);
      },
    });
  }, [activeSection, onCameraTransitionComplete, setIsTransitioning]);

  // ---------------------------------------------------------------------------
  // 12. RAYCASTING & INTERACTION HANDLERS (Hover highlight & Click to Navigate)
  // ---------------------------------------------------------------------------
  const raycaster = useRef(new THREE.Raycaster());
  const mousePointer = useRef(new THREE.Vector2());

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();

    // Normalized device coords [-1, 1]
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    mousePointer.current.set(x, y);

    // Parallax target
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;

    // If currently in a transition, skip hover interactions
    if (isTransitioningRef.current) return;

    raycaster.current.setFromCamera(mousePointer.current, cameraRef.current);

    // Check intersections against interactive groups
    let hitGroup: THREE.Group | null = null;
    for (const group of interactiveObjectsRef.current) {
      const intersects = raycaster.current.intersectObjects(group.children, true);
      if (intersects.length > 0) {
        hitGroup = group;
        break;
      }
    }

    if (hitGroup !== hoveredGroupRef.current) {
      // Un-hover previous
      if (hoveredGroupRef.current) {
        gsap.to(hoveredGroupRef.current.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.25,
          ease: 'power2.out',
        });
      }

      // Hover new
      if (hitGroup) {
        hoveredGroupRef.current = hitGroup;
        sounds.playHover();
        gsap.to(hitGroup.scale, {
          x: 1.06,
          y: 1.06,
          z: 1.06,
          duration: 0.25,
          ease: 'power2.out',
        });
        const sectionId = hitGroup.userData.sectionId as SectionId;
        const name = hitGroup.userData.name as string;
        onHoverObject(sectionId, name);
      } else {
        hoveredGroupRef.current = null;
        onHoverObject(null, null);
      }
    }
  };

  const handlePointerLeave = () => {
    if (hoveredGroupRef.current) {
      gsap.to(hoveredGroupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.25,
        ease: 'power2.out',
      });
      hoveredGroupRef.current = null;
    }
    onHoverObject(null, null);
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isTransitioningRef.current || !mountRef.current || !cameraRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mousePointer.current.set(x, y);

    raycaster.current.setFromCamera(mousePointer.current, cameraRef.current);

    for (const group of interactiveObjectsRef.current) {
      const intersects = raycaster.current.intersectObjects(group.children, true);
      if (intersects.length > 0) {
        const sectionId = group.userData.sectionId as SectionId;
        if (sectionId !== activeSectionRef.current) {
          sounds.playClick();
          onSelectSection(sectionId);
        }
        break;
      }
    }
  };

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full select-none cursor-default ${
        hoveredGroupRef.current ? 'cursor-pointer' : ''
      }`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      tabIndex={0}
      aria-label="3D Interactive Desk Scene"
    />
  );
};

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (e) {
      console.warn("WebGL renderer not initialized:", e);
      return;
    }

    const width = container.clientWidth || (typeof window !== "undefined" ? window.innerWidth : 1200);
    const height = container.clientHeight || (typeof window !== "undefined" ? window.innerHeight : 800);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2));

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Dynamic Multi-Color Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const purpleLight = new THREE.PointLight(0x7c3aed, 3.5, 20);
    purpleLight.position.set(4, 4, 4);
    scene.add(purpleLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 3, 20);
    blueLight.position.set(-5, -3, 3);
    scene.add(blueLight);

    const pinkLight = new THREE.PointLight(0xec4899, 2, 15);
    pinkLight.position.set(0, 5, -2);
    scene.add(pinkLight);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Central AI Orb with Glowing Orbital Rings
    const orbGeo = new THREE.SphereGeometry(1.1, 64, 64);
    const orbMat = new THREE.MeshPhongMaterial({
      color: 0x7c3aed,
      emissive: 0x5b21b6,
      shininess: 120,
      transparent: true,
      opacity: 0.85,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    rootGroup.add(orb);

    // Orbital Ring 1
    const ringGeo1 = new THREE.TorusGeometry(1.6, 0.02, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.6,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    rootGroup.add(ring1);

    // Orbital Ring 2
    const ringGeo2 = new THREE.TorusGeometry(2.1, 0.015, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.4,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    rootGroup.add(ring2);

    // Helper: Glass Panel Creator
    function createGlassPanel(w: number, h: number, d: number, color: number, opacity = 0.45) {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.1,
        roughness: 0.1,
        transparent: true,
        opacity: opacity,
        transmission: 0.85,
        thickness: 0.6,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      });
      return new THREE.Mesh(geo, mat);
    }

    // 2. Floating AI Invoice Panel
    const invoicePanel = createGlassPanel(1.5, 2.1, 0.06, 0xffffff, 0.5);
    invoicePanel.position.set(-3.2, 1.2, -0.5);
    invoicePanel.rotation.set(0.2, 0.4, -0.1);
    rootGroup.add(invoicePanel);

    // Line decorations on invoice
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed });
    for (let i = 0; i < 4; i++) {
      const lineGeo = new THREE.BoxGeometry(1.0, 0.06, 0.08);
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.set(0, 0.5 - i * 0.35, 0.04);
      invoicePanel.add(line);
    }

    // 3. Floating Analytics Dashboard Panel
    const dashboardPanel = createGlassPanel(2.4, 1.4, 0.06, 0x3b82f6, 0.4);
    dashboardPanel.position.set(3.4, -0.8, -0.3);
    dashboardPanel.rotation.set(-0.15, -0.45, 0.1);
    rootGroup.add(dashboardPanel);

    // 3D Bar Chart Pillars on Dashboard Panel
    const barColors = [0x60a5fa, 0x7c3aed, 0x34d399, 0xf59e0b, 0xec4899];
    const barHeights = [0.4, 0.7, 0.5, 0.9, 0.6];
    barHeights.forEach((h, idx) => {
      const barGeo = new THREE.BoxGeometry(0.18, h, 0.12);
      const barMat = new THREE.MeshStandardMaterial({
        color: barColors[idx],
        metalness: 0.3,
        roughness: 0.2,
      });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(-0.8 + idx * 0.38, -0.3 + h / 2, 0.08);
      dashboardPanel.add(bar);
    });

    // 4. 3D Payment Credit Card
    const cardGeo = new THREE.BoxGeometry(1.6, 1.0, 0.04);
    const cardMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x312e81,
    });
    const creditCard = new THREE.Mesh(cardGeo, cardMat);
    creditCard.position.set(2.2, 1.8, -1.2);
    creditCard.rotation.set(0.3, -0.3, 0.2);
    rootGroup.add(creditCard);

    // Gold Chip on Credit Card
    const chipGeo = new THREE.BoxGeometry(0.25, 0.2, 0.06);
    const chipMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
    const chip = new THREE.Mesh(chipGeo, chipMat);
    chip.position.set(-0.4, 0.1, 0.03);
    creditCard.add(chip);

    // 5. Floating Glass Cubes
    const glassCubes: THREE.Mesh[] = [];
    const cubeGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    for (let i = 0; i < 6; i++) {
      const cubeMat = new THREE.MeshPhysicalMaterial({
        color: i % 2 === 0 ? 0x7c3aed : 0x3b82f6,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
        transmission: 0.8,
      });
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      cube.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 3
      );
      rootGroup.add(cube);
      glassCubes.push(cube);
    }

    // 6. Gradient Floating Spheres
    const spheres: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const r = 0.15 + Math.random() * 0.2;
      const sGeo = new THREE.SphereGeometry(r, 32, 32);
      const sMat = new THREE.MeshPhongMaterial({
        color: i % 2 === 0 ? 0xec4899 : 0x60a5fa,
        emissive: i % 2 === 0 ? 0x831843 : 0x1e3a8a,
        shininess: 90,
      });
      const sphere = new THREE.Mesh(sGeo, sMat);
      sphere.position.set(
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4
      );
      rootGroup.add(sphere);
      spheres.push(sphere);
    }

    // 7. 3D Sine Wave Graph Line
    const curvePoints: THREE.Vector3[] = [];
    for (let i = -4; i <= 4; i += 0.2) {
      curvePoints.push(new THREE.Vector3(i, Math.sin(i * 1.2) * 0.6 - 1.8, -0.5));
    }
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.03, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.8 });
    const graphLine = new THREE.Mesh(tubeGeo, tubeMat);
    rootGroup.add(graphLine);

    camera.position.z = 7;

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / (window.innerWidth || 1200) - 0.5) * 0.8;
      mouseY = (e.clientY / (window.innerHeight || 800) - 0.5) * 0.8;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;

    // Animation Loop
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      orb.rotation.y += 0.008;
      orb.rotation.x = Math.sin(time * 0.5) * 0.1;
      ring1.rotation.z += 0.005;
      ring2.rotation.z -= 0.007;

      invoicePanel.position.y = 1.2 + Math.sin(time * 0.8) * 0.15;
      invoicePanel.rotation.z = Math.cos(time * 0.6) * 0.04;

      dashboardPanel.position.y = -0.8 + Math.cos(time * 0.7) * 0.12;
      dashboardPanel.rotation.z = Math.sin(time * 0.5) * 0.03;

      creditCard.position.y = 1.8 + Math.sin(time * 0.9) * 0.18;
      creditCard.rotation.y = -0.3 + Math.sin(time * 0.4) * 0.1;

      glassCubes.forEach((cube, idx) => {
        cube.rotation.x += 0.01 * (idx + 1);
        cube.rotation.y += 0.012 * (idx + 1);
        cube.position.y += Math.sin(time + idx) * 0.003;
      });

      spheres.forEach((sphere, idx) => {
        sphere.position.y += Math.cos(time * 1.2 + idx) * 0.004;
      });

      purpleLight.position.x = Math.sin(time * 0.6) * 5;
      purpleLight.position.y = Math.cos(time * 0.4) * 5;

      renderer.render(scene, camera);
    }

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || (typeof window !== "undefined" ? window.innerWidth : 1200);
      const h = container.clientHeight || (typeof window !== "undefined" ? window.innerHeight : 800);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [isMounted]);

  if (!isMounted) {
    return <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden" aria-hidden="true" />;
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}

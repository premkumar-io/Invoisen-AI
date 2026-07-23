import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function Hero3DModel() {
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

    const width = container.clientWidth || 550;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Rich Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const purplePointLight = new THREE.PointLight(0x8b5cf6, 4, 20);
    purplePointLight.position.set(-4, 3, 4);
    scene.add(purplePointLight);

    const bluePointLight = new THREE.PointLight(0x3b82f6, 3, 20);
    bluePointLight.position.set(4, -3, 4);
    scene.add(bluePointLight);

    // Root Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // 1. Central 3D Glass Invoice Card (Swiss Glassmorphism)
    const cardShapeGeo = new THREE.BoxGeometry(3.6, 2.3, 0.12);
    const cardMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1e1b4b,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.6,
      opacity: 0.95,
      transparent: true,
      thickness: 0.8,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });
    const cardMesh = new THREE.Mesh(cardShapeGeo, cardMaterial);
    cardMesh.rotation.set(0.15, -0.25, 0.05);
    modelGroup.add(cardMesh);

    // Gold Chip
    const chipGeo = new THREE.BoxGeometry(0.5, 0.4, 0.14);
    const chipMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15,
    });
    const chipMesh = new THREE.Mesh(chipGeo, chipMat);
    chipMesh.position.set(-1.1, 0.3, 0.08);
    cardMesh.add(chipMesh);

    // Holographic Badge Bar
    const badgeGeo = new THREE.BoxGeometry(1.6, 0.22, 0.14);
    const badgeMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.6,
      metalness: 0.5,
    });
    const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    badgeMesh.position.set(0.6, 0.6, 0.08);
    cardMesh.add(badgeMesh);

    // Line items representation
    for (let i = 0; i < 3; i++) {
      const lineGeo = new THREE.BoxGeometry(2.4, 0.1, 0.14);
      const lineMat = new THREE.MeshStandardMaterial({
        color: i === 0 ? 0x3b82f6 : 0x64748b,
        metalness: 0.4,
      });
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.position.set(-0.2, -0.2 - i * 0.35, 0.08);
      cardMesh.add(lineMesh);
    }

    // 2. Floating 3D Gold Coins in Orbit
    const coins: THREE.Mesh[] = [];
    const coinGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.08, 32);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.1,
    });

    const coinPositions = [
      { x: -2.8, y: 1.6, z: 1.2 },
      { x: 2.6, y: -1.4, z: 1.5 },
      { x: 2.2, y: 2.0, z: -0.8 },
    ];

    coinPositions.forEach((pos) => {
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.set(pos.x, pos.y, pos.z);
      coin.rotation.x = Math.PI / 3;
      modelGroup.add(coin);
      coins.push(coin);
    });

    // 3. Glowing AI Core Torus Ring
    const ringGeo = new THREE.TorusGeometry(2.6, 0.05, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.8,
      metalness: 0.8,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 4;
    modelGroup.add(ringMesh);

    // Outer Thin Ring
    const outerRingGeo = new THREE.TorusGeometry(3.3, 0.02, 16, 100);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7,
    });
    const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRingMesh.rotation.y = Math.PI / 3;
    modelGroup.add(outerRingMesh);

    // 4. Floating 3D Data Spheres
    const spheres: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const sGeo = new THREE.SphereGeometry(0.12 + Math.random() * 0.1, 24, 24);
      const sMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xec4899 : 0x3b82f6,
        roughness: 0.2,
        metalness: 0.8,
      });
      const sphere = new THREE.Mesh(sGeo, sMat);
      const angle = (i / 8) * Math.PI * 2;
      sphere.position.set(Math.cos(angle) * 3.8, Math.sin(angle) * 2.2, (Math.random() - 0.5) * 2);
      modelGroup.add(sphere);
      spheres.push(sphere);
    }

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      const time = Date.now() * 0.0015;

      // Smooth model rotation towards mouse
      modelGroup.rotation.y += (mouseX * 0.6 - modelGroup.rotation.y) * 0.05;
      modelGroup.rotation.x += (-mouseY * 0.4 - modelGroup.rotation.x) * 0.05;

      // Floating card animation
      cardMesh.position.y = Math.sin(time) * 0.15;
      cardMesh.rotation.z = Math.cos(time * 0.8) * 0.03;

      // Rotate coins
      coins.forEach((c, idx) => {
        c.rotation.y += 0.02 * (idx + 1);
        c.position.y += Math.sin(time * 1.5 + idx) * 0.005;
      });

      // Rotate rings
      ringMesh.rotation.z += 0.008;
      outerRingMesh.rotation.z -= 0.01;

      // Floating spheres orbit
      spheres.forEach((s, idx) => {
        s.position.y += Math.sin(time * 2 + idx) * 0.004;
      });

      purplePointLight.position.x = Math.sin(time) * 4;
      bluePointLight.position.x = Math.cos(time) * 4;

      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 550;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      if (container && renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[500px] relative z-20 cursor-grab active:cursor-grabbing"
    />
  );
}

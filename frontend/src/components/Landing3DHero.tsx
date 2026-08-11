import { useEffect, useRef, useState } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */

export function Landing3DHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const container = containerRef.current;
    if (!container) return;

    let isDestroyed = false;
    let animId: number;
    let isVisible = true;
    let renderer: any;

    const initThree = async () => {
      try {
        const THREE = await import("three");
        if (isDestroyed || !container) return;

        try {
          renderer = new (THREE as any).WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          });
        } catch (e) {
          console.warn("WebGL renderer not initialized:", e);
          return;
        }

        const width =
          container.clientWidth ||
          container.getBoundingClientRect().width ||
          (typeof window !== "undefined" ? window.innerWidth : 560);
        const height =
          container.clientHeight ||
          container.getBoundingClientRect().height ||
          420;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 7.5);

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        if ((THREE as any).ACESFilmicToneMapping) {
          renderer.toneMapping = (THREE as any).ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.35;
        }

        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        container.appendChild(renderer.domElement);

        // ── Studio Lighting System ─────────────────────────────────────────────
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
        scene.add(ambientLight);

        const mainKeyLight = new THREE.DirectionalLight(0x60a5fa, 4);
        mainKeyLight.position.set(6, 8, 6);
        scene.add(mainKeyLight);

        const purplePointLight = new THREE.PointLight(0xc084fc, 6, 25);
        purplePointLight.position.set(-5, 4, 4);
        scene.add(purplePointLight);

        const cyanPointLight = new THREE.PointLight(0x38bdf8, 5, 25);
        cyanPointLight.position.set(5, -4, 4);
        scene.add(cyanPointLight);

        const emeraldPointLight = new THREE.PointLight(0x34d399, 4, 20);
        emeraldPointLight.position.set(0, -3, 3);
        scene.add(emeraldPointLight);

        // ── Master Group for Interactive Parallax ────────────────────────────────
        const masterGroup = new THREE.Group();
        const initialScale = width < 640 ? 0.6 : width < 1024 ? 0.8 : 1.0;
        masterGroup.scale.set(initialScale, initialScale, initialScale);
        scene.add(masterGroup);

        // 1. Central 3D Quantum Wireframe Cyber Orb
        const orbGroup = new THREE.Group();
        masterGroup.add(orbGroup);

        // Inner Glowing Wireframe Core (Icosahedron)
        const wireframeGeo = new (THREE as any).IcosahedronGeometry(1.6, 2);
        const wireframeMat = new THREE.MeshStandardMaterial({
          color: 0x818cf8,
          emissive: 0x4f46e5,
          emissiveIntensity: 0.8,
          wireframe: true,
          metalness: 0.8,
          roughness: 0.2,
        });
        const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat);
        orbGroup.add(wireframeMesh);

        // Outer Translucent Glass Shield
        const glassGeo = new THREE.SphereGeometry(1.85, 32, 32);
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0x0f172a,
          metalness: 0.1,
          roughness: 0.05,
          transmission: 0.85,
          opacity: 0.95,
          transparent: true,
          thickness: 0.8,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
          ior: 1.5,
        });
        const glassMesh = new THREE.Mesh(glassGeo, glassMat);
        orbGroup.add(glassMesh);

        // Inner Core Nucleus (Glowing Sphere)
        const nucleusGeo = new THREE.SphereGeometry(0.8, 24, 24);
        const nucleusMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 1.2,
          metalness: 0.9,
          roughness: 0.1,
        });
        const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
        orbGroup.add(nucleusMesh);

        // 2. Floating 3D Gold Currency Tokens Orbiting
        const tokens: any[] = [];
        const tokenGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 24);
        const tokenMat = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          metalness: 0.95,
          roughness: 0.1,
        });

        const tokenPositions = [
          { x: -2.7, y: 1.4, z: 1.1, rx: 0.7, ry: 0.5 },
          { x: 2.6, y: -1.2, z: 1.3, rx: -0.5, ry: 0.9 },
          { x: 2.3, y: 1.6, z: -1.0, rx: 0.4, ry: -0.6 },
          { x: -2.3, y: -1.6, z: -0.7, rx: 1.0, ry: 0.3 },
        ];

        tokenPositions.forEach((pos) => {
          const token = new THREE.Mesh(tokenGeo, tokenMat);
          token.position.set(pos.x, pos.y, pos.z);
          token.rotation.set(pos.rx, pos.ry, 0);
          masterGroup.add(token);
          tokens.push(token);
        });

        // 3. Triple Holographic Orbit Rings (Cyan, Purple, Gold)
        const ring1Geo = new THREE.TorusGeometry(2.7, 0.035, 16, 120);
        const ring1Mat = new THREE.MeshStandardMaterial({
          color: 0xc084fc,
          emissive: 0xa855f7,
          emissiveIntensity: 0.9,
          metalness: 0.8,
        });
        const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
        ring1Mesh.rotation.set(Math.PI / 3, 0.2, 0);
        masterGroup.add(ring1Mesh);

        const ring2Geo = new THREE.TorusGeometry(3.4, 0.025, 16, 120);
        const ring2Mat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.8,
        });
        const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
        ring2Mesh.rotation.set(-Math.PI / 4, -0.3, 0);
        masterGroup.add(ring2Mesh);

        const ring3Geo = new THREE.TorusGeometry(3.9, 0.015, 16, 120);
        const ring3Mat = new THREE.MeshBasicMaterial({
          color: 0x34d399,
          transparent: true,
          opacity: 0.6,
        });
        const ring3Mesh = new THREE.Mesh(ring3Geo, ring3Mat);
        ring3Mesh.rotation.set(Math.PI / 6, 0.6, 0);
        masterGroup.add(ring3Mesh);

        // 4. Floating Quantum AI Crystal Nodes
        const nodes: { mesh: any; initialY: number; speed: number }[] = [];
        const nodeColors = [0x38bdf8, 0xc084fc, 0x34d399, 0xf472b6, 0x818cf8];

        for (let i = 0; i < 8; i++) {
          const size = 0.14 + Math.random() * 0.12;
          const nGeo = new (THREE as any).OctahedronGeometry(size, 0);
          const col = nodeColors[i % nodeColors.length];
          const nMat = new THREE.MeshPhysicalMaterial({
            color: col,
            emissive: col,
            emissiveIntensity: 0.7,
            metalness: 0.3,
            roughness: 0.1,
            transmission: 0.6,
            transparent: true,
            opacity: 0.9,
          });
          const node = new THREE.Mesh(nGeo, nMat);
          const angle = (i / 8) * Math.PI * 2;
          const dist = 3.2 + Math.random() * 0.8;
          const initialY = Math.sin(angle * 2) * 1.5;

          node.position.set(Math.cos(angle) * dist, initialY, (Math.random() - 0.5) * 2.2);
          masterGroup.add(node);
          nodes.push({ mesh: node, initialY, speed: 0.8 + Math.random() * 0.8 });
        }

        // ── Mouse Parallax Interaction ─────────────────────────────────────────
        let mouseX = 0;
        let mouseY = 0;
        let targetRotationX = 0;
        let targetRotationY = 0;

        const handleMouseMove = (e: MouseEvent) => {
          const rect = container.getBoundingClientRect();
          mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
          mouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
          targetRotationY = mouseX * 0.5;
          targetRotationX = -mouseY * 0.35;
        };

        window.addEventListener("mousemove", handleMouseMove);

        // Visibility & Intersection Observers
        const handleVisibilityChange = () => {
          isVisible = !document.hidden;
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        const observer = new IntersectionObserver(
          ([entry]) => {
            isVisible = entry.isIntersecting && !document.hidden;
          },
          { threshold: 0.01 },
        );
        if (container) observer.observe(container);

        // ── Animation Loop ───────────────────────────────────────────────────────
        function animate() {
          if (isDestroyed) return;
          animId = requestAnimationFrame(animate);

          if (!isVisible) return;

          const time = Date.now() * 0.0012;

          // Smooth mouse parallax interpolation
          masterGroup.rotation.y += (targetRotationY - masterGroup.rotation.y) * 0.04;
          masterGroup.rotation.x += (targetRotationX - masterGroup.rotation.x) * 0.04;

          // Central Orb Levitation & Pulsing Rotations
          wireframeMesh.rotation.y += 0.01;
          wireframeMesh.rotation.x += 0.005;
          nucleusMesh.rotation.y -= 0.015;
          orbGroup.position.y = Math.sin(time * 1.5) * 0.15;

          // Token Spins
          tokens.forEach((t, idx) => {
            t.rotation.y += 0.02 * (idx + 1);
            t.rotation.z += 0.01;
            t.position.y += Math.sin(time * 2 + idx) * 0.004;
          });

          // Orbit Ring Rotations
          ring1Mesh.rotation.z += 0.008;
          ring2Mesh.rotation.z -= 0.01;
          ring3Mesh.rotation.z += 0.005;

          // Floating Crystal Nodes Oscillation
          nodes.forEach((n) => {
            n.mesh.rotation.x += 0.02;
            n.mesh.rotation.y += 0.02;
            n.mesh.position.y = n.initialY + Math.sin(time * n.speed) * 0.25;
          });

          // Light Shifts
          purplePointLight.position.x = Math.sin(time * 1.2) * 5;
          cyanPointLight.position.x = Math.cos(time * 1.2) * 5;

          renderer.render(scene, camera);
        }

        animate();

        // ── Resize Handler ───────────────────────────────────────────────────────
        const handleResize = () => {
          if (!container || !renderer) return;
          const w =
            container.clientWidth ||
            container.getBoundingClientRect().width ||
            (typeof window !== "undefined" ? window.innerWidth : 560);
          const h =
            container.clientHeight ||
            container.getBoundingClientRect().height ||
            420;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
          const currentScale = w < 640 ? 0.6 : w < 1024 ? 0.8 : 1.0;
          masterGroup.scale.set(currentScale, currentScale, currentScale);
        };

        window.addEventListener("resize", handleResize);

        return () => {
          isDestroyed = true;
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("resize", handleResize);
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          if (observer && container) observer.unobserve(container);
          cancelAnimationFrame(animId);
          if (container && renderer && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          if (renderer) {
            renderer.dispose();
          }
        };
      } catch (err) {
        console.warn("Failed to initialize Landing3DHero:", err);
      }
    };

    const cleanupPromise = initThree();

    return () => {
      isDestroyed = true;
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <div className="relative w-full h-full min-h-[380px] md:min-h-[420px] flex items-center justify-center">
      {/* Glow ambient background aura behind 3D canvas */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Three.js 3D Viewport Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-[380px] md:h-[420px] relative z-20 cursor-grab active:cursor-grabbing flex items-center justify-center"
      />
    </div>
  );
}

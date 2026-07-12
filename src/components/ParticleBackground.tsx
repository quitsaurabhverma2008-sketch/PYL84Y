'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ParticleBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Vibrant color palette — neon / social media vibes
    const palette = [
      new THREE.Color('#FF006E'), // hot pink
      new THREE.Color('#FF4D6D'), // rose
      new THREE.Color('#FF758F'), // light rose
      new THREE.Color('#8338EC'), // purple
      new THREE.Color('#C77DFF'), // light purple
      new THREE.Color('#3A86FF'), // electric blue
      new THREE.Color('#48BFE3'), // cyan
      new THREE.Color('#56CFE1'), // light cyan
      new THREE.Color('#00F5D4'), // mint
      new THREE.Color('#00BBF9'), // sky
      new THREE.Color('#FEE440'), // yellow
      new THREE.Color('#F9C74F'), // gold
      new THREE.Color('#FF9E00'), // orange
      new THREE.Color('#FF6D00'), // deep orange
      new THREE.Color('#06D6A0'), // emerald
      new THREE.Color('#118AB2'), // teal
      new THREE.Color('#EF476F'), // coral
      new THREE.Color('#7209B7'), // deep purple
    ];

    // ── Particles ──
    const particleCount = 350;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      sizes[i] = Math.random() * 5 + 2;
      velocities[i * 3] = (Math.random() - 0.5) * 0.015;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.015;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.008;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const vertexShader = `
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (250.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
    const fragmentShader = `
      varying vec3 vColor;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        gl_FragColor = vec4(vColor, alpha * 0.75);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // ── Large glowing orbs ──
    const orbs: THREE.Mesh[] = [];
    const orbColors = ['#FF006E', '#8338EC', '#3A86FF', '#00F5D4', '#FEE440', '#FF6D00', '#06D6A0', '#EF476F'];
    for (let i = 0; i < 8; i++) {
      const size = 1.2 + Math.random() * 2;
      const orbGeo = new THREE.SphereGeometry(size, 24, 24);
      const orbMat = new THREE.MeshBasicMaterial({
        color: orbColors[i % orbColors.length],
        transparent: true,
        opacity: 0.12 + Math.random() * 0.08,
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, -4 - Math.random() * 3);
      scene.add(orb);
      orbs.push(orb);
    }

    // ── Ring shapes ──
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const ringGeo = new THREE.TorusGeometry(0.8 + Math.random() * 1.5, 0.06, 12, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: palette[Math.floor(Math.random() * palette.length)],
        transparent: true,
        opacity: 0.15 + Math.random() * 0.1,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, -2 - Math.random() * 4);
      ring.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(ring);
      rings.push(ring);
    }

    camera.position.z = 6;

    let animId: number;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Drift particles
      const pos = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += velocities[i * 3];
        pos[i * 3 + 1] += velocities[i * 3 + 1];
        pos[i * 3 + 2] += velocities[i * 3 + 2];
        if (Math.abs(pos[i * 3]) > 12) velocities[i * 3] *= -1;
        if (Math.abs(pos[i * 3 + 1]) > 12) velocities[i * 3 + 1] *= -1;
        if (Math.abs(pos[i * 3 + 2]) > 6) velocities[i * 3 + 2] *= -1;
      }
      geometry.attributes.position.needsUpdate = true;

      // Animate orbs
      orbs.forEach((orb, i) => {
        orb.position.x = Math.sin(time * 0.25 + i * 1.3) * 5;
        orb.position.y = Math.cos(time * 0.18 + i * 1.7) * 4;
        orb.position.z = -4 + Math.sin(time * 0.15 + i) * 1.5;
        orb.scale.setScalar(1 + Math.sin(time * 0.6 + i * 0.8) * 0.25);
        (orb.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.sin(time * 0.4 + i * 1.2) * 0.06;
      });

      // Rotate rings
      rings.forEach((ring, i) => {
        ring.rotation.x += 0.003 + i * 0.001;
        ring.rotation.y += 0.005 + i * 0.001;
        ring.position.x = Math.sin(time * 0.2 + i * 2) * 4;
        ring.position.y = Math.cos(time * 0.15 + i * 2.5) * 3;
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.12 + Math.sin(time * 0.5 + i) * 0.06;
      });

      // Parallax
      camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 0.6 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      orbs.forEach(o => { o.geometry.dispose(); (o.material as THREE.Material).dispose(); });
      rings.forEach(r => { r.geometry.dispose(); (r.material as THREE.Material).dispose(); });
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

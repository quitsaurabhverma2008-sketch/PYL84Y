'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ChatBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Colorful flowing grid
    const gridGeo = new THREE.PlaneGeometry(30, 30, 30, 30);
    const gridMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        vec3 palette(float t) {
          vec3 a = vec3(0.5, 0.5, 0.5);
          vec3 b = vec3(0.5, 0.5, 0.5);
          vec3 c = vec3(1.0, 1.0, 1.0);
          vec3 d = vec3(0.00, 0.33, 0.67);
          return a + b * cos(6.28318 * (c * t + d));
        }
        void main() {
          float grid = 0.0;
          float scaleX = step(0.97, fract(vUv.x * 20.0));
          float scaleY = step(0.97, fract(vUv.y * 20.0));
          grid = max(scaleX, scaleY);
          vec3 col = palette(vUv.x + vUv.y + uTime * 0.05);
          float alpha = grid * 0.12 * (1.0 - length(vUv - 0.5) * 1.2);
          gl_FragColor = vec4(col, alpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -5;
    scene.add(grid);

    // Colorful floating orbs
    const orbColors = ['#FF006E', '#8338EC', '#3A86FF', '#00F5D4', '#FEE440', '#FF6D00', '#06D6A0', '#EF476F', '#C77DFF', '#48BFE3'];
    const glowCount = 10;
    const glows: THREE.Mesh[] = [];
    for (let i = 0; i < glowCount; i++) {
      const size = 0.15 + Math.random() * 0.25;
      const geo = new THREE.SphereGeometry(size, 12, 12);
      const mat = new THREE.MeshBasicMaterial({
        color: orbColors[i % orbColors.length],
        transparent: true,
        opacity: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 10, -2);
      scene.add(mesh);
      glows.push(mesh);
    }

    // Floating rings
    const ringCount = 4;
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < ringCount; i++) {
      const rGeo = new THREE.TorusGeometry(0.4 + Math.random() * 0.6, 0.03, 8, 32);
      const rMat = new THREE.MeshBasicMaterial({
        color: orbColors[i * 2 % orbColors.length],
        transparent: true,
        opacity: 0.12,
      });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8, -3);
      scene.add(rMesh);
      rings.push(rMesh);
    }

    camera.position.set(0, 0, 6);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      gridMat.uniforms.uTime.value = t;

      glows.forEach((g, i) => {
        g.position.x = Math.sin(t * 0.3 + i * 1.2) * 6;
        g.position.y = Math.cos(t * 0.25 + i * 1.5) * 4;
        g.scale.setScalar(1 + Math.sin(t * 0.8 + i) * 0.3);
        (g.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(t * 0.5 + i) * 0.08;
      });

      rings.forEach((r, i) => {
        r.rotation.x += 0.004;
        r.rotation.y += 0.006;
        r.position.x = Math.sin(t * 0.2 + i * 2) * 5;
        r.position.y = Math.cos(t * 0.18 + i * 2.5) * 3;
        (r.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.sin(t * 0.6 + i) * 0.06;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth;
      const nh = mountRef.current.clientHeight;
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      glows.forEach(g => { g.geometry.dispose(); (g.material as THREE.Material).dispose(); });
      rings.forEach(r => { r.geometry.dispose(); (r.material as THREE.Material).dispose(); });
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

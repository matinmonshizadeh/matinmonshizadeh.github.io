import { useEffect, useRef } from 'react';

export default function ShaderCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // No WebGL on mobile — container may be display:none, dimensions would be 0
    if (window.innerWidth < 768) return;

    const isTablet = window.innerWidth < 1024;
    const COUNT = isTablet ? 60 : 120;

    // Mutable state shared between async setup and sync cleanup
    let mounted = true;
    let frameId = 0;
    let disposeAll: (() => void) | undefined;

    // Dynamic import — Three.js loads in its own chunk, not the initial bundle
    import('three').then(({
      Scene,
      PerspectiveCamera,
      WebGLRenderer,
      BufferGeometry,
      Float32BufferAttribute,
      Points,
      PointsMaterial,
      Color,
    }) => {
      if (!mounted || !container) return;

      // ── Scene ──────────────────────────────────────────────────────────
      const scene = new Scene();

      const camera = new PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        50,
      );
      camera.position.z = 5;

      // Transparent renderer — CSS hero-radial gradient shows through
      const renderer = new WebGLRenderer({ antialias: false, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      // ── Particles ──────────────────────────────────────────────────────
      const positions = new Float32Array(COUNT * 3);
      const alphas    = new Float32Array(COUNT);

      for (let i = 0; i < COUNT; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 14; // x
        positions[i * 3 + 1] = (Math.random() - 0.5) * 8;  // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 5;  // z (depth)
        alphas[i] = 0.3 + Math.random() * 0.5;              // vary opacity per particle
      }

      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

      const material = new PointsMaterial({
        color:         new Color('#3FE0C5'),
        size:          0.07,
        transparent:   true,
        opacity:       0.65,
        sizeAttenuation: true,
        depthWrite:    false,
      });

      const particles = new Points(geometry, material);
      scene.add(particles);

      // ── Mouse parallax ─────────────────────────────────────────────────
      let mouseX = 0;
      let mouseY = 0;

      const onMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('mousemove', onMouseMove, { passive: true });

      // ── Resize ─────────────────────────────────────────────────────────
      const resizeObserver = new ResizeObserver(() => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
      resizeObserver.observe(container);

      // ── Animation loop ─────────────────────────────────────────────────
      let time = 0;

      const tick = () => {
        frameId = requestAnimationFrame(tick);
        time += 0.001;

        // Gentle autonomous motion
        particles.rotation.y += 0.0003;
        particles.rotation.x  = Math.sin(time * 0.4) * 0.04;

        // Mouse parallax — lerp scene rotation toward target
        scene.rotation.y += (mouseX * 0.3  - scene.rotation.y) * 0.04;
        scene.rotation.x += (-mouseY * 0.2 - scene.rotation.x) * 0.04;

        renderer.render(scene, camera);
      };

      // Pause when tab is hidden to save resources
      const onVisibilityChange = () => {
        if (document.hidden) {
          cancelAnimationFrame(frameId);
        } else {
          tick();
        }
      };
      document.addEventListener('visibilitychange', onVisibilityChange);

      tick();

      // ── Cleanup closure ────────────────────────────────────────────────
      disposeAll = () => {
        cancelAnimationFrame(frameId);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('mousemove', onMouseMove);
        resizeObserver.disconnect();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    }).catch(() => {
      // WebGL init failed silently — CSS fallback remains visible
    });

    return () => {
      mounted = false;
      cancelAnimationFrame(frameId); // safe no-op if frameId is still 0
      disposeAll?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
}

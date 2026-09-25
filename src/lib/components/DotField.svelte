<script lang="ts">
  import { onMount } from "svelte";

  type Props = {
    dotRadius?: number;
    dotSpacing?: number;
    cursorRadius?: number;
    cursorForce?: number;
    bulgeOnly?: boolean;
    bulgeStrength?: number;
    glowRadius?: number;
    sparkle?: boolean;
    waveAmplitude?: number;
    gradientFrom?: string;
    gradientTo?: string;
    glowColor?: string;
    class?: string;
  };

  let {
    dotRadius = 1.5,
    dotSpacing = 14,
    cursorRadius = 500,
    cursorForce = 0.1,
    bulgeOnly = true,
    bulgeStrength = 67,
    glowRadius = 160,
    sparkle = false,
    waveAmplitude = 0,
    gradientFrom = "#ff3e00",
    gradientTo = "#ffb089",
    glowColor = "#14110e",
    class: className = ""
  }: Props = $props();

  let canvas = $state<HTMLCanvasElement | null>(null);
  let container = $state<HTMLDivElement | null>(null);

  function parseHex(hex: string): [number, number, number] {
    const clean = hex.replace("#", "");
    if (clean.length === 3) {
      return [
        parseInt(clean[0] + clean[0], 16),
        parseInt(clean[1] + clean[1], 16),
        parseInt(clean[2] + clean[2], 16)
      ];
    }
    return [
      parseInt(clean.slice(0, 2), 16) || 255,
      parseInt(clean.slice(2, 4), 16) || 62,
      parseInt(clean.slice(4, 6), 16) || 0
    ];
  }

  onMount(() => {
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = container.offsetWidth || window.innerWidth);
    let height = (canvas.height = container.offsetHeight || window.innerHeight);

    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    const resize = () => {
      if (!canvas || !container) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.offsetWidth || window.innerWidth;
      height = container.offsetHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(container);
    resize();

    let rafId = 0;
    let time = 0;

    const [r1, g1, b1] = parseHex(gradientFrom);
    const [r2, g2, b2] = parseHex(gradientTo);

    let isVisible = true;
    const render = () => {
      if (!isVisible) {
        rafId = 0;
        return;
      }
      time += 0.016;

      // Smooth cursor lerp
      mouseX += (targetMouseX - mouseX) * 0.12;
      mouseY += (targetMouseY - mouseY) * 0.12;

      ctx.clearRect(0, 0, width, height);

      // 1. Soft radial glow around cursor
      if (glowRadius > 0 && mouseX > -500) {
        const glow = ctx.createRadialGradient(
          mouseX,
          mouseY,
          0,
          mouseX,
          mouseY,
          glowRadius
        );
        glow.addColorStop(0, "rgba(255, 110, 30, 0.08)");
        glow.addColorStop(0.5, "rgba(20, 17, 14, 0.45)");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      const cols = Math.ceil(width / dotSpacing) + 2;
      const rows = Math.ceil(height / dotSpacing) + 2;
      const spacing = dotSpacing;

      // Render dots
      for (let i = -1; i < cols; i++) {
        const baseX = i * spacing;
        const normX = Math.max(0, Math.min(1, baseX / width));

        // Precompute color for column
        const red = Math.round(r1 + (r2 - r1) * normX);
        const green = Math.round(g1 + (g2 - g1) * normX);
        const blue = Math.round(b1 + (b2 - b1) * normX);

        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.beginPath();

        for (let j = -1; j < rows; j++) {
          const baseY = j * spacing;

          let x = baseX;
          let y = baseY;

          // Ambient wave
          if (waveAmplitude > 0) {
            y += Math.sin(x * 0.02 + time * 1.5) * waveAmplitude;
          }

          let r = dotRadius;

          // Cursor bulge effect
          if (mouseX > -500) {
            const dx = x - mouseX;
            const dy = y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < cursorRadius && dist > 0) {
              const factor = 1 - dist / cursorRadius;
              // Smooth cosine hemisphere bulge curve
              const bulgeCurve = Math.cos((dist / cursorRadius) * Math.PI * 0.5);
              const displacement = bulgeCurve * bulgeStrength * cursorForce * 4;

              // Push outward radially from cursor
              const angle = Math.atan2(dy, dx);
              x += Math.cos(angle) * displacement;
              y += Math.sin(angle) * displacement;

              // Subtly enlarge dots near center of bulge
              r = dotRadius * (1 + bulgeCurve * 0.45);
            }
          }

          // Optional sparkle
          if (sparkle) {
            const tw = Math.sin(i * 3.1 + j * 7.7 + time * 2);
            r *= 0.8 + 0.4 * Math.max(0, tw);
          }

          ctx.moveTo(x + r, y);
          ctx.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2);
        }

        ctx.fill();
      }

      rafId = requestAnimationFrame(render);
    };

    const io = new IntersectionObserver((entries) => {
      isVisible = Boolean(entries[0]?.isIntersecting);
      if (isVisible && !rafId) {
        rafId = requestAnimationFrame(render);
      }
    }, { threshold: 0.02 });
    if (container) io.observe(container);

    rafId = requestAnimationFrame(render);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      io.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      ro.disconnect();
    };
  });
</script>

<div
  bind:this={container}
  class="pointer-events-none absolute inset-0 w-full h-full overflow-hidden {className}"
>
  <canvas bind:this={canvas} class="block w-full h-full"></canvas>
</div>

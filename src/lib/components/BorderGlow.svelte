<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    children?: Snippet;
    glowColor?: string;
    glowSize?: number;
    borderRadius?: string;
    borderWidth?: number;
    animated?: boolean;
    class?: string;
  };

  let {
    children,
    glowColor = 'rgba(255, 140, 0, 0.15)',
    glowSize = 240,
    borderRadius = '12px',
    borderWidth = 1,
    animated = true,
    class: className = ''
  }: Props = $props();

  let containerRef = $state<HTMLDivElement | null>(null);
  let mouseX = $state(-1000);
  let mouseY = $state(-1000);
  let isHovered = $state(false);

  function handleMouseMove(e: MouseEvent) {
    if (!animated || !containerRef) return;
    const rect = containerRef.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    isHovered = true;
  }

  function handleMouseLeave() {
    if (!animated) return;
    isHovered = false;
    mouseX = -1000;
    mouseY = -1000;
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={containerRef}
  onmousemove={handleMouseMove}
  onmouseleave={handleMouseLeave}
  class="relative overflow-hidden {className}"
  style="border-radius: {borderRadius};"
>
  {#if animated}
    <!-- Pointer-following border glow -->
    <div
      class="pointer-events-none absolute -inset-px transition-opacity duration-300"
      style="
        opacity: {isHovered ? 1 : 0};
        background: radial-gradient({glowSize}px circle at {mouseX}px {mouseY}px, {glowColor}, transparent 70%);
        border-radius: inherit;
        z-index: 0;
      "
    ></div>
  {/if}

  <div class="relative z-10 w-full h-full">
    {@render children?.()}
  </div>
</div>

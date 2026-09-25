<script lang="ts">
  import { onMount } from 'svelte';

  type Props = {
    targetSelector?: string;
    color?: string;
    class?: string;
  };

  let {
    targetSelector = '.cursor-target',
    color = '#ff8c00',
    class: className = ''
  }: Props = $props();

  let isTouchDevice = $state(false);
  let isHoveringTarget = $state(false);
  let cursorRef = $state<HTMLDivElement | null>(null);

  let mouseX = -100;
  let mouseY = -100;
  let posX = -100;
  let posY = -100;
  let currentTarget: HTMLElement | null = null;

  onMount(() => {
    isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = (e.target as HTMLElement)?.closest(targetSelector) as HTMLElement | null;
      currentTarget = target;
    };

    let animationFrameId: number;
    const updateCursor = () => {
      posX += (mouseX - posX) * 0.25;
      posY += (mouseY - posY) * 0.25;

      if (cursorRef) {
        if (currentTarget && document.body.contains(currentTarget)) {
          isHoveringTarget = true;
          const rect = currentTarget.getBoundingClientRect();
          cursorRef.style.transform = `translate3d(${rect.left - 4}px, ${rect.top - 4}px, 0)`;
          cursorRef.style.width = `${rect.width + 8}px`;
          cursorRef.style.height = `${rect.height + 8}px`;
          cursorRef.style.borderRadius = '8px';
          cursorRef.style.opacity = '1';
        } else {
          isHoveringTarget = false;
          cursorRef.style.transform = `translate3d(${posX - 12}px, ${posY - 12}px, 0)`;
          cursorRef.style.width = '24px';
          cursorRef.style.height = '24px';
          cursorRef.style.borderRadius = '50%';
          cursorRef.style.opacity = mouseX < 0 ? '0' : '0.35';
        }
      }

      animationFrameId = requestAnimationFrame(updateCursor);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  });
</script>

{#if !isTouchDevice}
  <div
    bind:this={cursorRef}
    class="pointer-events-none fixed top-0 left-0 z-50 transition-colors border {isHoveringTarget ? 'border-dashed border-[#ff8c00]/80' : 'border-[#ff8c00]/30'} {className}"
    style="
      transition: width 0.18s cubic-bezier(0.16, 1, 0.3, 1), height 0.18s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.18s ease-out, opacity 0.18s ease-out;
      will-change: transform;
      box-shadow: {isHoveringTarget ? '0 0 12px rgba(255, 140, 0, 0.35)' : 'none'};
    "
  >
    {#if isHoveringTarget}
      <!-- Tight targeting crosshairs at corners framing the exact icon -->
      <div class="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[#ffdb58]"></div>
      <div class="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-[#ffdb58]"></div>
      <div class="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-[#ffdb58]"></div>
      <div class="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[#ffdb58]"></div>
    {:else}
      <!-- Center targeting dot when tracking mouse freely -->
      <div class="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-[#ff8c00]/60"></div>
    {/if}
  </div>
{/if}

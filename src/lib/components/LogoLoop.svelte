<script lang="ts">
  import type { SkillItem } from '../data/logos';

  type Props = {
    items?: SkillItem[];
    direction?: 'left' | 'right';
    speed?: number;
    pauseOnHover?: boolean;
    iconSize?: number;
    class?: string;
  };

  let {
    items = [],
    direction = 'left',
    speed = 25,
    pauseOnHover = true,
    iconSize = 44,
    class: className = ''
  }: Props = $props();

  // Ensure minimum items in a set so track comfortably spans wide displays without gaps
  const minItemsPerSet = 10;
  const repeatCount = $derived(
    items.length === 0 ? 1 : Math.max(1, Math.ceil(minItemsPerSet / items.length))
  );

  const repeatedItems = $derived(
    Array.from({ length: repeatCount }, () => items).flat()
  );
</script>

<div 
  class="relative w-full overflow-hidden py-1 group/loop select-none {className}"
  style="--speed: {speed}s;"
>
  <!-- Edge Gradient Masks for clean entry and exit -->
  <div class="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-24 z-10 bg-gradient-to-r from-[#1a130d] to-transparent"></div>
  <div class="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-24 z-10 bg-gradient-to-l from-[#1a130d] to-transparent"></div>

  <!-- Scrolling Track Container -->
  <div class="flex w-max {pauseOnHover ? 'group-hover/loop:[animation-play-state:paused]' : ''}">
    <div class="flex shrink-0 items-center will-change-transform {direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}">
      
      <!-- Primary Set -->
      <div class="flex shrink-0 items-center">
        {#each repeatedItems as item, idx (`primary-${item.id}-${idx}`)}
          <div class="mr-8 md:mr-11 flex items-center justify-center">
            <img 
              src={item.src} 
              alt={item.alt}
              title={item.name}
              style="height: {iconSize}px; width: {iconSize}px;"
              class="object-contain transition-all duration-200 hover:scale-120 cursor-pointer filter hover:brightness-125 {item.invertDark ? 'brightness-0 invert opacity-90 hover:opacity-100' : ''}"
              loading="lazy"
            />
          </div>
        {/each}
      </div>

      <!-- Identical Clone Set for 100% Seamless Infinite Looping -->
      <div class="flex shrink-0 items-center" aria-hidden="true">
        {#each repeatedItems as item, idx (`clone-${item.id}-${idx}`)}
          <div class="mr-8 md:mr-11 flex items-center justify-center">
            <img 
              src={item.src} 
              alt={item.alt}
              title={item.name}
              style="height: {iconSize}px; width: {iconSize}px;"
              class="object-contain transition-all duration-200 hover:scale-120 cursor-pointer filter hover:brightness-125 {item.invertDark ? 'brightness-0 invert opacity-90 hover:opacity-100' : ''}"
              loading="lazy"
            />
          </div>
        {/each}
      </div>

    </div>
  </div>
</div>

<style>
  @keyframes marquee-left {
    0% {
      transform: translate3d(0, 0, 0);
    }
    100% {
      transform: translate3d(-50%, 0, 0);
    }
  }

  @keyframes marquee-right {
    0% {
      transform: translate3d(-50%, 0, 0);
    }
    100% {
      transform: translate3d(0, 0, 0);
    }
  }

  .animate-marquee-left {
    animation: marquee-left var(--speed, 25s) linear infinite;
  }

  .animate-marquee-right {
    animation: marquee-right var(--speed, 25s) linear infinite;
  }
</style>

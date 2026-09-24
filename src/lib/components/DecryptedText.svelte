<script lang="ts">
  import { onMount } from 'svelte';

  type RevealDirection = 'start' | 'end' | 'center';
  type AnimateOn = 'view' | 'hover' | 'all';

  type Props = {
    text: string;
    speed?: number;
    maxIterations?: number;
    sequential?: boolean;
    revealDirection?: RevealDirection;
    useOriginalCharsOnly?: boolean;
    characters?: string;
    animateOn?: AnimateOn;
    class?: string;
    encryptedClass?: string;
  };

  let {
    text,
    speed = 40,
    maxIterations = 8,
    sequential = true,
    revealDirection = 'start',
    useOriginalCharsOnly = false,
    characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=<>?',
    animateOn = 'hover',
    class: className = '',
    encryptedClass = 'text-[#ff8c00]'
  }: Props = $props();

  let displayText = $state('');
  let isHovering = $state(false);
  let isScrambling = $state(false);
  let containerRef = $state<HTMLSpanElement | null>(null);
  let intervalId: number | null = null;

  $effect(() => {
    if (!isScrambling) {
      displayText = text;
    }
  });

  function getRandomChar(origChar: string): string {
    if (origChar === ' ') return ' ';
    if (useOriginalCharsOnly) {
      const distinctChars = Array.from(new Set(text.replace(/\s/g, '')));
      if (distinctChars.length > 0) {
        return distinctChars[Math.floor(Math.random() * distinctChars.length)];
      }
    }
    return characters[Math.floor(Math.random() * characters.length)];
  }

  function getRevealOrder(len: number, dir: RevealDirection): number[] {
    const indices = Array.from({ length: len }, (_, i) => i);
    if (dir === 'end') {
      return indices.reverse();
    }
    if (dir === 'center') {
      const center = Math.floor(len / 2);
      return indices.sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
    }
    return indices; // 'start'
  }

  export function triggerScramble() {
    if (isScrambling) return;
    isScrambling = true;

    const len = text.length;
    const revealOrder = getRevealOrder(len, revealDirection);
    let currentIteration = 0;
    let revealedCount = 0;

    if (intervalId) clearInterval(intervalId);

    intervalId = window.setInterval(() => {
      currentIteration++;

      if (sequential) {
        // Sequentially reveal characters based on revealOrder
        if (currentIteration % 2 === 0 && revealedCount < len) {
          revealedCount++;
        }
      } else {
        // Resolve all characters together once maxIterations is approached
        if (currentIteration >= maxIterations) {
          revealedCount = len;
        }
      }

      const revealedIndices = new Set(revealOrder.slice(0, revealedCount));
      const chars = text.split('').map((char, index) => {
        if (char === ' ') return ' ';
        if (revealedIndices.has(index) || currentIteration >= maxIterations + len) {
          return char;
        }
        return getRandomChar(char);
      });

      displayText = chars.join('');

      if (revealedCount >= len && currentIteration >= maxIterations) {
        if (intervalId) clearInterval(intervalId);
        displayText = text;
        isScrambling = false;
      }
    }, speed);
  }

  function handleMouseEnter() {
    if (animateOn === 'hover' || animateOn === 'all') {
      isHovering = true;
      triggerScramble();
    }
  }

  function handleMouseLeave() {
    isHovering = false;
  }

  onMount(() => {
    displayText = text;

    if (animateOn === 'view' || animateOn === 'all') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              triggerScramble();
            }
          });
        },
        { threshold: 0.2 }
      );

      if (containerRef) {
        observer.observe(containerRef);
      }

      return () => {
        observer.disconnect();
        if (intervalId) clearInterval(intervalId);
      };
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
  bind:this={containerRef}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  class="inline-block cursor-default select-none {className || 'font-mono'}"
>
  {displayText}
</span>

<script lang="ts">
  import { onMount } from 'svelte';

  type RevealDirection = 'start' | 'end' | 'center';
  type AnimateOn = 'view' | 'hover' | 'all';

  type Props = {
    text: string;
    speed?: number; // 60ms default
    maxIterations?: number; // 10 default
    sequential?: boolean; // false default
    revealDirection?: RevealDirection; // 'start' default
    useOriginalCharsOnly?: boolean; // false default
    characters?: string;
    animateOn?: AnimateOn; // 'hover' default
    class?: string;
    parentClass?: string;
    encryptedClass?: string;
  };

  let {
    text,
    speed = 60,
    maxIterations = 10,
    sequential = false,
    revealDirection = 'start',
    useOriginalCharsOnly = false,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
    animateOn = 'hover',
    class: className = '',
    parentClass = '',
    encryptedClass = 'text-[#ffdb58]'
  }: Props = $props();

  let displayText = $state('');
  let isAnimating = $state(false);
  let isDecrypted = $state(true);
  let revealedIndices = $state<Set<number>>(new Set());
  let containerRef = $state<HTMLSpanElement | null>(null);
  let intervalId: number | null = null;
  let hasAnimatedInView = false;

  // Compute available characters based on useOriginalCharsOnly
  let availableChars = $derived.by(() => {
    if (useOriginalCharsOnly) {
      const distinct = Array.from(new Set(text.replace(/\s/g, '')));
      return distinct.length > 0 ? distinct : ['?'];
    }
    return characters.split('');
  });

  // Calculate reveal order based on direction
  function computeOrder(len: number, dir: RevealDirection): number[] {
    const order: number[] = [];
    if (len <= 0) return order;
    if (dir === 'start') {
      for (let i = 0; i < len; i++) order.push(i);
      return order;
    }
    if (dir === 'end') {
      for (let i = len - 1; i >= 0; i--) order.push(i);
      return order;
    }
    // center reveal
    const middle = Math.floor(len / 2);
    let offset = 0;
    while (order.length < len) {
      if (offset % 2 === 0) {
        const idx = middle + offset / 2;
        if (idx >= 0 && idx < len) order.push(idx);
      } else {
        const idx = middle - Math.ceil(offset / 2);
        if (idx >= 0 && idx < len) order.push(idx);
      }
      offset++;
    }
    return order.slice(0, len);
  }

  function shuffleText(originalText: string, currentRevealed: Set<number>): string {
    const charsList = availableChars;
    return originalText
      .split('')
      .map((char, i) => {
        if (char === ' ') return ' ';
        if (currentRevealed.has(i)) return originalText[i];
        return charsList[Math.floor(Math.random() * charsList.length)];
      })
      .join('');
  }

  export function triggerDecrypt() {
    if (isAnimating) return;
    if (intervalId) clearInterval(intervalId);

    const len = text.length;
    let currentIteration = 0;
    const order = computeOrder(len, revealDirection);
    const newRevealed = new Set<number>();

    isAnimating = true;
    isDecrypted = false;
    revealedIndices = new Set();

    intervalId = window.setInterval(() => {
      currentIteration++;

      if (sequential) {
        // Sequential mode: reveal characters step-by-step
        if (newRevealed.size < len) {
          const nextIndex = order[newRevealed.size];
          if (nextIndex !== undefined) {
            newRevealed.add(nextIndex);
          }
        }
        revealedIndices = new Set(newRevealed);
        displayText = shuffleText(text, newRevealed);

        if (newRevealed.size >= len && currentIteration >= maxIterations) {
          if (intervalId) clearInterval(intervalId);
          intervalId = null;
          isAnimating = false;
          isDecrypted = true;
          displayText = text;
        }
      } else {
        // Non-sequential mode (exact setting from user screenshot):
        // All non-revealed chars scramble simultaneously every frame
        displayText = shuffleText(text, newRevealed);

        // Gradually lock in characters as currentIteration approaches maxIterations
        const progress = currentIteration / maxIterations;
        const targetRevealedCount = Math.floor(progress * len);
        while (newRevealed.size < targetRevealedCount && newRevealed.size < len) {
          const nextIdx = order[newRevealed.size];
          if (nextIdx !== undefined) newRevealed.add(nextIdx);
        }
        revealedIndices = new Set(newRevealed);

        if (currentIteration >= maxIterations) {
          if (intervalId) clearInterval(intervalId);
          intervalId = null;
          isAnimating = false;
          isDecrypted = true;
          displayText = text;
          revealedIndices = new Set(order);
        }
      }
    }, speed);
  }

  function resetToPlainText() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isAnimating = false;
    isDecrypted = true;
    displayText = text;
    revealedIndices = new Set();
  }

  function handleMouseEnter() {
    if (animateOn === 'hover' || animateOn === 'all') {
      triggerDecrypt();
    }
  }

  function handleMouseLeave() {
    if (animateOn === 'hover') {
      resetToPlainText();
    }
  }

  $effect(() => {
    if (!isAnimating) {
      displayText = text;
    }
  });

  onMount(() => {
    displayText = text;

    if (animateOn === 'view' || animateOn === 'all') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimatedInView) {
              hasAnimatedInView = true;
              triggerDecrypt();
            }
          });
        },
        { threshold: 0.15 }
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
  class="inline-block cursor-default select-none {parentClass}"
>
  <span class="sr-only">{text}</span>
  <span aria-hidden="true" class="inline">
    {#each displayText.split('') as char, index (index)}
      {@const isRevealedOrDone = revealedIndices.has(index) || (!isAnimating && isDecrypted)}
      {#if char === ' '}
        <span class="inline-block whitespace-pre">&nbsp;</span>
      {:else}
        <span class="inline-block transition-colors duration-100 {isRevealedOrDone ? className : encryptedClass}">
          {char}
        </span>
      {/if}
    {/each}
  </span>
</span>

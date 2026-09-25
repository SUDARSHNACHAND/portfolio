<script lang="ts">
  import { gsap } from "gsap";
  import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
  import { SplitText } from "gsap/SplitText";
  import type { Snippet } from "svelte";

  gsap.registerPlugin(SplitText, ScrambleTextPlugin);

  type TagName = 'p' | 'span' | 'h2' | 'h3' | 'h4' | 'div';

  type Props = {
    radius?: number;
    duration?: number;
    speed?: number;
    scrambleChars?: string;
    className?: string;
    style?: string;
    as?: TagName;
    text?: string;
    children?: Snippet;
  };

  let {
    radius = 100,
    duration = 1.2,
    speed = 0.5,
    scrambleChars = ".:",
    className = "",
    style = "",
    as: tag = "p",
    text,
    children,
  }: Props = $props();

  let rootEl = $state<HTMLElement | undefined>();

  $effect(() => {
    void radius;
    void duration;
    void speed;
    void scrambleChars;

    if (!rootEl) return;

    // Use SplitText on rootEl with words & chars for bulletproof word wrapping
    const split = SplitText.create(rootEl, {
      type: "words,chars",
      wordsClass: "inline-block whitespace-nowrap",
      charsClass: "inline-block will-change-transform",
    });

    const chars = split.chars as HTMLElement[];
    chars.forEach((c) => {
      const content = c.innerHTML;
      gsap.set(c, { attr: { "data-content": content } });
    });

    let rafId: number | null = null;
    let pendingEvent: PointerEvent | null = null;
    let charPositions: { el: HTMLElement; x: number; y: number; content: string }[] = [];

    const updatePositions = () => {
      charPositions = chars.map((c) => {
        const rect = c.getBoundingClientRect();
        return {
          el: c,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          content: c.dataset.content || "",
        };
      });
    };

    const processMove = () => {
      if (!pendingEvent) return;
      const mouseX = pendingEvent.clientX;
      const mouseY = pendingEvent.clientY;

      for (let i = 0; i < charPositions.length; i++) {
        const item = charPositions[i];
        // Never scramble empty spaces or whitespace
        if (!item.content.trim()) continue;

        const dx = mouseX - item.x;
        const dy = mouseY - item.y;
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          gsap.to(item.el, {
            overwrite: true,
            duration: duration * (1 - dist / radius),
            scrambleText: {
              text: item.content,
              chars: scrambleChars,
              speed,
            },
            ease: "none",
          });
        }
      }
      rafId = null;
    };

    const handlePointerEnter = () => {
      updatePositions();
    };

    const handlePointerMove = (e: PointerEvent) => {
      pendingEvent = e;
      if (charPositions.length === 0) {
        updatePositions();
      }
      if (rafId === null) {
        rafId = requestAnimationFrame(processMove);
      }
    };

    rootEl.addEventListener("pointerenter", handlePointerEnter);
    rootEl.addEventListener("pointermove", handlePointerMove);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rootEl?.removeEventListener("pointerenter", handlePointerEnter);
      rootEl?.removeEventListener("pointermove", handlePointerMove);
      split.revert();
    };
  });
</script>

<svelte:element
  this={tag}
  bind:this={rootEl}
  class="{className}"
  {style}
>
  {#if children}
    {@render children()}
  {:else if text}
    {text}
  {/if}
</svelte:element>

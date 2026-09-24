<script lang="ts">
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import FaultyTerminal from "./FaultyTerminal.svelte";
  import ScrollReveal from "./ScrollReveal.svelte";

  type Props = {
    scrollContainer?: HTMLElement | null;
  };

  import { portfolioStore } from "../data/portfolioStore.svelte";

  let { scrollContainer = null }: Props = $props();

  // Dynamic About content from portfolioStore (editable by admin)
  let sectionLabel = $derived(portfolioStore.about.sectionLabel);
  let headingText = $derived(portfolioStore.about.headingText);
  let p1Text = $derived(portfolioStore.about.p1Text);
  let p2Text = $derived(portfolioStore.about.p2Text);
  let p3Text = $derived(portfolioStore.about.p3Text);
  let techBadges = $derived(portfolioStore.about.techBadges);

  let sectionRef = $state<HTMLElement | null>(null);
  let contentWrapperRef = $state<HTMLDivElement | null>(null);
  let badgesContainerRef = $state<HTMLDivElement | null>(null);

  onMount(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    let hasAnimated = false;
    const runAnimations = () => {
      if (hasAnimated) return;
      hasAnimated = true;

      // 1. GSAP subtle entrance fade & slide for section container
      if (contentWrapperRef) {
        gsap.fromTo(
          contentWrapperRef,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" }
        );
      }

      // Subtle entrance for DevOps tags
      if (badgesContainerRef) {
        const badgeItems = badgesContainerRef.querySelectorAll(".about-tech-tag");
        if (badgeItems.length > 0) {
          gsap.fromTo(
            badgeItems,
            { opacity: 0, y: 12, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
              stagger: 0.05,
              delay: 0.4,
              ease: "back.out(1.4)"
            }
          );
        }
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          runAnimations();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef) observer.observe(sectionRef);

    return () => {
      observer.disconnect();
    };
  });
</script>

<section
  id="about"
  bind:this={sectionRef}
  class="relative min-h-screen w-full text-white z-20 bg-[#1a130d] overflow-hidden select-text flex flex-col justify-center items-center py-24 md:py-32"
  aria-label="About Me"
>
  <!-- FaultyTerminal Background Effect -->
  <div class="pointer-events-none absolute inset-0 w-full h-full z-0 overflow-hidden opacity-30">
    <FaultyTerminal
      scale={1.5}
      digitSize={1.2}
      timeScale={0.35}
      scanlineIntensity={0.35}
      curvature={0.1}
      tint="#FF8A4C"
      mouseReact={true}
      mouseStrength={0.4}
      pageLoadAnimation={true}
      noiseAmp={0.8}
      brightness={0.55}
    />
  </div>

  <!-- Gradient overlay so text has 100% legibility -->
  <div
    class="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1a130d]/85 via-[#1a130d]/55 to-[#1a130d]/90 z-0"
    aria-hidden="true"
  ></div>

  <!-- Subtle DevOps Grid Overlay -->
  <div
    class="pointer-events-none absolute inset-0 z-0 opacity-15 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_65%,transparent_100%)]"
    aria-hidden="true"
  ></div>

  <!-- Soft Ambient Glow -->
  <div
    class="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#ff8c00]/12 via-[#ffdb58]/5 to-transparent blur-[90px] rounded-full z-0"
    aria-hidden="true"
  ></div>

  <!-- Viewport Content Container -->
  <div
    bind:this={contentWrapperRef}
    class="relative z-10 max-w-4xl mx-auto w-full px-6 sm:px-8 md:px-12 flex flex-col gap-6 md:gap-8"
  >
    <!-- Section Label & Heading with ScrollReveal -->
    <div class="flex flex-col gap-3 text-left">
      <div class="flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-[#ff8c00]"></span>
        <span class="text-xs sm:text-sm font-mono font-bold tracking-[0.25em] text-[#ff8c00] uppercase">
          {sectionLabel}
        </span>
      </div>

      <h1
        class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ffdb58] to-[#ff8c00] leading-[1.18]"
      >
        {headingText}
      </h1>
    </div>

    <!-- Main About Paragraphs with ScrollReveal Effect & Vertical Terminal Accent Rail -->
    <div class="relative border-l-2 border-[#ff8c00]/30 pl-4 sm:pl-6 md:pl-8 flex flex-col gap-5 sm:gap-6 text-left">
      <!-- Paragraph 1 -->
      <ScrollReveal
        text={p1Text}
        {scrollContainer}
        enableBlur={true}
        baseOpacity={0.15}
        baseRotation={0}
        blurStrength={3}
        containerClassName="!my-0"
        textClassName="!text-base sm:!text-lg md:!text-[1.075rem] !leading-relaxed !font-normal text-gray-200"
        wordAnimationEnd="center 60%"
      />

      <!-- Paragraph 2 -->
      <ScrollReveal
        text={p2Text}
        {scrollContainer}
        enableBlur={true}
        baseOpacity={0.15}
        baseRotation={0}
        blurStrength={3}
        containerClassName="!my-0"
        textClassName="!text-base sm:!text-lg md:!text-[1.075rem] !leading-relaxed !font-normal text-gray-300"
        wordAnimationEnd="center 60%"
      />

      <!-- Paragraph 3 -->
      <ScrollReveal
        text={p3Text}
        {scrollContainer}
        enableBlur={true}
        baseOpacity={0.15}
        baseRotation={0}
        blurStrength={3}
        containerClassName="!my-0"
        textClassName="!text-base sm:!text-lg md:!text-[1.075rem] !leading-relaxed !font-normal text-gray-300"
        wordAnimationEnd="center 60%"
      />
    </div>

    <!-- Minimal DevOps Tech Tags Highlights -->
    <div
      bind:this={badgesContainerRef}
      class="pt-2 flex flex-col gap-3 text-left"
    >
      <span class="text-[11px] font-mono uppercase tracking-[0.2em] text-gray-400 select-none">
        Key Technologies & Focus Areas
      </span>

      <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {#each techBadges as badge (badge)}
          <span
            class="about-tech-tag inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono text-gray-200 bg-[#14110e]/90 border border-white/10 hover:border-[#ff8c00]/50 hover:text-[#ffdb58] transition-all duration-200 shadow-sm backdrop-blur-sm cursor-default select-none"
          >
            <span class="w-1 h-1 rounded-full bg-[#ff8c00]/80"></span>
            {badge}
          </span>
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  :global(.scroll-reveal) {
    margin: 0 !important;
  }
</style>

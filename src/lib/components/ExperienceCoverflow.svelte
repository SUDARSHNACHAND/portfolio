<script lang="ts">
  import { onMount } from "svelte";
  import { portfolioStore } from "../data/portfolioStore.svelte";

  export type ExperienceItem = {
    id?: string;
    type: "internship" | "achievement";
    year: string;
    number: string;
    title: string;
    organization: string;
    duration?: string;
    category?: string;
    project?: string;
    description?: string;
    date?: string;
    certName: string;
    certFile: string;
    fileType: "image" | "pdf";
  };

  type Props = {
    items?: ExperienceItem[];
    onViewCertificate?: (item: ExperienceItem) => void;
    class?: string;
  };

  let { items: customItems, onViewCertificate, class: className = "" }: Props = $props();

  const DEFAULT_ITEMS: ExperienceItem[] = [
    {
      type: "internship",
      year: "2024",
      number: "01",
      title: "IoT / INTERNET OF THINGS",
      organization: "Imbed Software · Karaikudi",
      duration: "01 MAR — 08 MAR 2024",
      category: "Internet of Things",
      description: "Internship Training",
      certName: "IoT / Internet of Things Certification — Imbed Software",
      certFile: "/certification/2024.jpeg",
      fileType: "image"
    },
    {
      type: "internship",
      year: "2025",
      number: "02",
      title: "ARTIFICIAL INTELLIGENCE",
      organization: "SD Pro Solutions",
      duration: "18 JUN — 02 JUL 2025",
      category: "Artificial Intelligence",
      description: "Internship Training Program",
      certName: "Artificial Intelligence Internship Certification — SD Pro Solutions",
      certFile: "/certification/2025.jpeg",
      fileType: "image"
    },
    {
      type: "internship",
      year: "2026",
      number: "03",
      title: "UI / UX DESIGN",
      organization: "Approtech R&D Solutions Pvt. Ltd.",
      duration: "05 JUN — 06 JUL 2026",
      category: "UI / UX Design",
      project: "SkyLink — Smart Airport Experience",
      description: "Internship Program",
      certName: "UI/UX Design Certification: SkyLink Smart Airport Experience — Approtech R&D",
      certFile: "/certification/2026.jpeg",
      fileType: "image"
    },
    {
      type: "achievement",
      year: "2024",
      number: "02",
      title: "SECOND PRIZE",
      organization: "INNOVITA 2K24",
      category: "Paper Presentation",
      description: "State Level Symposium",
      project: "Alagappa Chettiar Government College of Engineering and Technology",
      date: "12 JUN 2024",
      certName: "Second Prize in Paper Presentation — INNOVITA 2K24, ACGCET Karaikudi",
      certFile: "/certification/acgcet-cf.pdf",
      fileType: "pdf"
    }
  ];

  let displayItems = $derived(
    customItems && customItems.length > 0
      ? customItems
      : (portfolioStore.experience && portfolioStore.experience.length > 0
          ? portfolioStore.experience
          : DEFAULT_ITEMS)
  );

  let activeIndex = $state(0);
  let total = $derived(displayItems.length);

  $effect(() => {
    if (activeIndex >= total && total > 0) {
      activeIndex = total - 1;
    }
  });

  // Real-time smooth dragging state
  let isDragging = $state(false);
  let dragOffset = $state(0);
  let startX = 0;
  let startTime = 0;
  let containerWidth = $state(700);
  let viewportEl = $state<HTMLDivElement | null>(null);
  let isHovered = $state(false);

  // Subtle interactive cursor spotlight on active card
  let mouseX = $state(0);
  let mouseY = $state(0);

  function next() {
    activeIndex = (activeIndex + 1) % total;
  }

  function prev() {
    activeIndex = (activeIndex - 1 + total) % total;
  }

  function goTo(index: number) {
    activeIndex = Math.max(0, Math.min(total - 1, index));
  }

  // Pointer & Touch handling with continuous real-time 60fps tracking
  function onPointerDown(clientX: number) {
    isDragging = true;
    startX = clientX;
    dragOffset = 0;
    startTime = Date.now();
  }

  function onPointerMove(clientX: number) {
    if (!isDragging) return;
    const diff = clientX - startX;
    // Elastic resistance when dragging past boundaries
    if (
      (activeIndex === 0 && diff > 0) ||
      (activeIndex === total - 1 && diff < 0)
    ) {
      dragOffset = diff * 0.35;
    } else {
      dragOffset = diff;
    }
  }

  function onPointerUp(clientX: number) {
    if (!isDragging) return;
    isDragging = false;
    const diff = clientX - startX;
    const elapsed = Date.now() - startTime;
    const velocity = Math.abs(diff) / Math.max(elapsed, 1);

    // Fast flick (>0.4px/ms) or drag beyond 60px snaps to next/prev
    if (Math.abs(diff) > 60 || velocity > 0.4) {
      if (diff > 0 && activeIndex > 0) {
        prev();
      } else if (diff < 0 && activeIndex < total - 1) {
        next();
      }
    }
    dragOffset = 0;
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      onPointerDown(e.touches[0].clientX);
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (isDragging && e.touches.length === 1) {
      onPointerMove(e.touches[0].clientX);
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (isDragging && e.changedTouches.length > 0) {
      onPointerUp(e.changedTouches[0].clientX);
    }
  }

  function handleMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    onPointerDown(e.clientX);
    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
  }

  function onWindowMouseMove(e: MouseEvent) {
    onPointerMove(e.clientX);
  }

  function onWindowMouseUp(e: MouseEvent) {
    window.removeEventListener("mousemove", onWindowMouseMove);
    window.removeEventListener("mouseup", onWindowMouseUp);
    onPointerUp(e.clientX);
  }

  function handleCardMouseMove(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  // Keyboard navigation when hovered
  function handleKeyDown(e: KeyboardEvent) {
    if (!isHovered) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  }

  // Horizontal mouse wheel gesture with smooth debounce
  let wheelTimeout: ReturnType<typeof setTimeout> | null = null;
  function handleWheel(e: WheelEvent) {
    if (Math.abs(e.deltaX) > 25 || (e.shiftKey && Math.abs(e.deltaY) > 25)) {
      e.preventDefault();
      if (wheelTimeout) return;
      if (e.deltaX > 25 || e.deltaY > 25) {
        next();
      } else {
        prev();
      }
      wheelTimeout = setTimeout(() => {
        wheelTimeout = null;
      }, 350);
    }
  }

  onMount(() => {
    if (viewportEl) {
      containerWidth = viewportEl.clientWidth || 700;
    }
    const updateWidth = () => {
      if (viewportEl) {
        containerWidth = viewportEl.clientWidth || 700;
      }
    };
    window.addEventListener("resize", updateWidth);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updateWidth);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUp);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  });
</script>

<section
  id="experience"
  class="relative w-full overflow-hidden py-10 sm:py-16 select-none {className}"
  aria-label="Experience & Recognition"
>
  <!-- Background Grid Texture -->
  <div
    class="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,122,0,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,122,0,.35)_1px,transparent_1px)] [background-size:42px_42px]"
    aria-hidden="true"
  ></div>

  <!-- Ambient Glow Behind Cards -->
  <div
    class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-orange-500/10 blur-[140px]"
    aria-hidden="true"
  ></div>

  <div class="relative mx-auto max-w-7xl px-4 sm:px-6">
    <!-- Header -->
    <div class="mb-12 sm:mb-16 max-w-3xl text-left">
      <div class="mb-4 sm:mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.35em] text-orange-400 font-bold">
        <span class="h-px w-10 bg-orange-500"></span>
        Experience &amp; Recognition
      </div>

      <h2 class="text-4xl font-bold tracking-tight text-white sm:text-6xl font-sans leading-[1.1]">
        Learning.<br />
        <span class="text-orange-500">Building.</span><br />
        Achieving.
      </h2>

      <p class="mt-5 sm:mt-6 max-w-2xl text-sm sm:text-base leading-relaxed text-zinc-400 font-sans">
        A collection of internships, practical experience, and academic achievements that have shaped my technical journey.
      </p>
    </div>

    <!-- 3D Coverflow Viewport -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      bind:this={viewportEl}
      class="relative w-full h-[520px] sm:h-[500px] md:h-[480px] flex items-center justify-center cursor-grab active:cursor-grabbing"
      style="perspective: 1200px; transform-style: preserve-3d;"
      ontouchstart={handleTouchStart}
      ontouchmove={handleTouchMove}
      ontouchend={handleTouchEnd}
      onmousedown={handleMouseDown}
      onwheel={handleWheel}
      onmouseenter={() => (isHovered = true)}
      onmouseleave={() => (isHovered = false)}
    >
      {#each displayItems as item, i (item.id || item.number + item.type + i)}
        {@const continuousOffset = (i - activeIndex) - (dragOffset / Math.max(containerWidth * 0.75, 420))}
        {@const absContinuous = Math.abs(continuousOffset)}
        {@const isCenter = Math.abs(continuousOffset) < 0.45}

        <!-- 3D Card Positioning with Kinetic Easing -->
        <div
          class="absolute top-0 bottom-0 flex items-center justify-center w-full max-w-[94vw] sm:max-w-[580px] md:max-w-[650px] lg:max-w-[680px]"
          style="
            transform: translateX(calc({continuousOffset * 52}% + {dragOffset * 0.4}px))
                       scale({Math.max(0.68, 1 - absContinuous * 0.14)})
                       rotateY({Math.max(-28, Math.min(28, continuousOffset * -18))}deg)
                       translateZ({isCenter ? 40 : -absContinuous * 85}px);
            opacity: {Math.max(0, 1 - absContinuous * 0.45)};
            z-index: {Math.round(30 - absContinuous * 10)};
            pointer-events: {absContinuous > 1.2 ? 'none' : 'auto'};
            filter: {absContinuous < 0.3 ? 'none' : `brightness(${Math.max(0.45, 1 - absContinuous * 0.4)}) blur(${Math.min(absContinuous * 1.5, 3)}px)`};
            transition: {isDragging ? 'none' : 'transform 550ms cubic-bezier(0.16, 1, 0.3, 1), opacity 550ms cubic-bezier(0.16, 1, 0.3, 1), filter 550ms ease'};
            will-change: transform, opacity;
          "
          onclick={() => {
            if (!isCenter && Math.abs(dragOffset) < 10) goTo(i);
          }}
          onkeydown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !isCenter) goTo(i);
          }}
          role="button"
          tabindex={isCenter ? 0 : -1}
          aria-label="{item.title} — {item.organization}"
        >
          {#if item.type === "achievement"}
            <!-- ============================================== -->
            <!-- ACHIEVEMENT CARD                               -->
            <!-- ============================================== -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <article
              class="relative min-h-[440px] w-full max-w-[680px] overflow-hidden rounded-3xl border border-orange-500/30 bg-[#18130F]/95 p-8 shadow-2xl backdrop-blur-xl text-left flex flex-col justify-between transition-all duration-500 hover:border-orange-500/60"
              onmousemove={handleCardMouseMove}
            >
              <!-- Interactive Spotlight Glow -->
              <div
                class="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style="background: radial-gradient(400px circle at {mouseX}px {mouseY}px, rgba(255, 122, 0, 0.12), transparent 80%);"
                aria-hidden="true"
              ></div>

              <!-- Top-Right Ambient Orange Glow -->
              <div
                class="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-500/20 blur-[80px]"
                aria-hidden="true"
              ></div>

              <!-- Giant Watermark Background Number -->
              <div
                class="absolute right-8 top-0 font-mono text-[130px] font-black leading-none text-orange-500/[0.06] select-none pointer-events-none"
                aria-hidden="true"
              >
                {item.number}
              </div>

              <!-- Header -->
              <div class="relative flex items-center justify-between z-10">
                <div class="flex items-center gap-3">
                  <span class="text-xl" aria-hidden="true">🏆</span>
                  <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-orange-400 font-bold">
                    Achievement
                  </span>
                </div>

                <span class="font-mono text-xs text-zinc-500 font-semibold">
                  {item.year}
                </span>
              </div>

              <!-- Main Body -->
              <div class="relative mt-12 z-10">
                <div class="font-mono text-6xl font-black leading-none text-orange-500">
                  {item.number}
                </div>

                <h3 class="mt-3 text-3xl font-black uppercase tracking-tight text-white font-sans">
                  {item.title}
                </h3>

                <div class="mt-6 h-px bg-gradient-to-r from-orange-500/70 to-transparent"></div>

                <p class="mt-6 text-lg font-semibold text-zinc-200">
                  {item.category}
                </p>

                <p class="mt-1 font-mono text-sm text-orange-400 font-bold">
                  {item.organization}
                </p>

                <p class="mt-5 text-sm text-zinc-400">
                  {item.description}
                </p>

                <p class="mt-2 max-w-lg text-sm leading-6 text-zinc-500">
                  {item.project}
                </p>
              </div>

              <!-- Footer -->
              <div class="relative mt-8 pt-4 border-t border-white/10 flex items-end justify-between z-10">
                <div>
                  <p class="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-600 font-semibold">
                    Award Date
                  </p>
                  <p class="mt-1 font-mono text-xs text-zinc-300 font-bold">
                    {item.date}
                  </p>
                </div>

                <button
                  type="button"
                  onclick={(e) => {
                    e.stopPropagation();
                    onViewCertificate?.(item);
                  }}
                  class="font-mono text-[10px] uppercase tracking-widest text-orange-400 transition hover:text-orange-300 cursor-pointer select-none font-bold py-1.5 px-3 rounded-lg hover:bg-orange-500/10 active:scale-95"
                >
                  View Certificate ↗
                </button>
              </div>
            </article>
          {:else}
            <!-- ============================================== -->
            <!-- INTERNSHIP CARD                                -->
            <!-- ============================================== -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <article
              class="group relative min-h-[440px] w-full max-w-[680px] overflow-hidden rounded-3xl border border-white/10 bg-[#18130F]/95 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-orange-500/40 text-left flex flex-col justify-between"
              onmousemove={handleCardMouseMove}
            >
              <!-- Interactive Spotlight Glow -->
              <div
                class="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style="background: radial-gradient(400px circle at {mouseX}px {mouseY}px, rgba(255, 122, 0, 0.1), transparent 80%);"
                aria-hidden="true"
              ></div>

              <!-- Giant Watermark Number -->
              <div
                class="absolute right-8 top-5 select-none font-mono text-7xl font-black text-white/[0.035] pointer-events-none"
                aria-hidden="true"
              >
                {item.number}
              </div>

              <!-- Top Badges -->
              <div class="relative flex items-center justify-between z-10">
                <span class="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-orange-400 font-bold">
                  Internship
                </span>

                <span class="font-mono text-xs text-zinc-500 font-semibold">
                  {item.year}
                </span>
              </div>

              <!-- Main Content -->
              <div class="relative mt-14 z-10">
                <p class="font-mono text-[10px] uppercase tracking-[0.3em] text-orange-400 font-bold">
                  {item.category}
                </p>

                <h3 class="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl font-sans">
                  {item.title}
                </h3>

                <p class="mt-3 text-sm text-zinc-400">
                  {item.organization}
                </p>

                <div class="my-8 h-px bg-white/10"></div>

                <!-- Info Grid -->
                <div class="grid grid-cols-2 gap-5">
                  <div>
                    <p class="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-600 font-semibold">
                      Duration
                    </p>
                    <p class="mt-2 text-sm font-medium text-zinc-200">
                      {item.duration || "—"}
                    </p>
                  </div>

                  <div>
                    <p class="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-600 font-semibold">
                      Type
                    </p>
                    <p class="mt-2 text-sm font-medium text-zinc-200">
                      {item.description || "Internship"}
                    </p>
                  </div>
                </div>

                {#if item.project}
                  <div class="mt-7 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p class="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-semibold">
                      Project
                    </p>
                    <p class="mt-2 text-sm font-medium text-zinc-200">
                      {item.project}
                    </p>
                  </div>
                {/if}
              </div>

              <!-- Footer -->
              <div class="relative mt-8 pt-4 border-t border-white/10 flex items-center justify-between z-10">
                <span class="font-mono text-[10px] text-zinc-600 tracking-wider">
                  EXPERIENCE_{item.number}
                </span>

                <button
                  type="button"
                  onclick={(e) => {
                    e.stopPropagation();
                    onViewCertificate?.(item);
                  }}
                  class="font-mono text-[10px] uppercase tracking-widest text-orange-400 transition hover:text-orange-300 cursor-pointer select-none font-bold py-1.5 px-3 rounded-lg hover:bg-orange-500/10 active:scale-95"
                >
                  View Certificate ↗
                </button>
              </div>
            </article>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Coverflow Controls (Live Announcer, Prev/Next, Dots) -->
    <div class="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-5 w-full max-w-4xl mx-auto mt-10 px-2">
      <!-- Live Announcer -->
      <div class="flex items-center gap-2 font-mono text-xs text-zinc-400">
        <span class="text-orange-400 font-bold">
          {displayItems[activeIndex]?.type?.toUpperCase() || "EXPERIENCE"}
        </span>
        <span class="text-zinc-600">•</span>
        <span>
          {total > 0 ? activeIndex + 1 : 0} of {total}
        </span>
        <span class="hidden sm:inline text-zinc-600">•</span>
        <span class="hidden sm:inline font-sans text-xs text-zinc-300 truncate max-w-[240px]">
          {displayItems[activeIndex]?.title || ""}
        </span>
      </div>

      <!-- Dots Navigation with smooth expanding pill -->
      <div class="flex items-center gap-2" role="tablist" aria-label="Choose experience">
        {#each displayItems as item, dotIdx}
          <button
            type="button"
            role="tab"
            aria-selected={dotIdx === activeIndex}
            onclick={() => goTo(dotIdx)}
            class="transition-all duration-300 cursor-pointer rounded-full h-2.5 {dotIdx === activeIndex ? 'w-8 bg-gradient-to-r from-orange-500 to-amber-400' : 'w-2.5 bg-white/20 hover:bg-white/40'}"
            aria-label="Choose {item.type} {dotIdx + 1}: {item.title}"
          ></button>
        {/each}
      </div>

      <!-- Prev / Next Navigation Buttons -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          onclick={prev}
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 bg-black/40 hover:border-orange-500/60 text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer text-xs font-mono font-bold hover:scale-105 active:scale-95 shadow-md shadow-black/50"
          aria-label="Previous"
        >
          <span aria-hidden="true">&larr;</span>
          <span>Previous</span>
        </button>

        <button
          type="button"
          onclick={next}
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 bg-black/40 hover:border-orange-500/60 text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer text-xs font-mono font-bold hover:scale-105 active:scale-95 shadow-md shadow-black/50"
          aria-label="Next"
        >
          <span>Next</span>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  </div>
</section>

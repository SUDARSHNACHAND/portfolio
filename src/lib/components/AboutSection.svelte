<script lang="ts">
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import Grainient from "./Grainient.svelte";
  import BorderGlow from "./BorderGlow.svelte";
  import GlareHover from "./GlareHover.svelte";
  import ExperienceCoverflow, { type ExperienceItem } from "./ExperienceCoverflow.svelte";
  import { portfolioStore } from "../data/portfolioStore.svelte";

  type Props = {
    scrollContainer?: HTMLElement | null;
  };

  let { scrollContainer = null }: Props = $props();

  let sectionRef = $state<HTMLElement | null>(null);
  let contentWrapperRef = $state<HTMLDivElement | null>(null);
  let activeCertModal = $state<ExperienceItem | null>(null);
  let copiedFeedback = $state(false);
  let copiedInternships = $state(false);

  const techBadges = [
    "Linux",
    "Git",
    "Docker",
    "Jenkins",
    "Kubernetes",
    "Terraform",
    "AWS",
    "CI/CD",
    "Cloud Infrastructure",
    "Infrastructure as Code",
    "Monitoring & Observability"
  ];

  const internships = [
    {
      id: "01",
      year: "2024",
      field: "IoT / INTERNET OF THINGS",
      company: "Imbed Software • Karaikudi",
      dates: "01 MAR — 08 MAR 2024",
      role: "Internet of Things",
      subtitle: "Internship • 8 Days",
      certName: "IoT / Internet of Things Certification — Imbed Software"
    },
    {
      id: "02",
      year: "2025",
      field: "ARTIFICIAL INTELLIGENCE",
      company: "SD Pro Solutions",
      dates: "18 JUN — 02 JUL 2025",
      role: "Artificial Intelligence",
      subtitle: "Internship Training Program",
      certName: "Artificial Intelligence Internship Certification — SD Pro Solutions"
    },
    {
      id: "03",
      year: "2026",
      field: "UI / UX DESIGN",
      company: "Approtech R&D Solutions Pvt. Ltd.",
      dates: "05 JUN — 06 JUL 2026",
      role: "Project",
      subtitle: "“SkyLink – Smart Airport Experience”",
      certName: "UI/UX Design Certification: SkyLink Smart Airport Experience — Approtech R&D"
    }
  ];

  function copySectionText() {
    const textToCopy = `B.E. COMPUTER SCIENCE & ENGINEERING\nMount Zion College of Engineering and Technology, Pudukkottai\nCGPA: 7.40 / 10 | Final Year 04\n\nHIGHER SECONDARY EDUCATION (Class XII)\nMaharishi Vidya Mandir School, Karaikudi\nPerformance: 63.67%`;
    navigator.clipboard?.writeText(textToCopy);
    copiedFeedback = true;
    setTimeout(() => {
      copiedFeedback = false;
    }, 2000);
  }

  function copyInternshipsText() {
    const textToCopy = internships
      .map(
        (item) =>
          `[${item.id}] ${item.field} (${item.year})\n${item.company}\n${item.dates}\nRole: ${item.role} - ${item.subtitle}`
      )
      .join("\n\n");
    navigator.clipboard?.writeText(textToCopy);
    copiedInternships = true;
    setTimeout(() => {
      copiedInternships = false;
    }, 2000);
  }

  onMount(() => {
    portfolioStore.syncWithPublishedContent();
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    let hasAnimated = false;
    const runAnimations = () => {
      if (hasAnimated) return;
      hasAnimated = true;

      if (contentWrapperRef) {
        gsap.fromTo(
          contentWrapperRef,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          runAnimations();
        }
      },
      { threshold: 0.1 }
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
  class="relative min-h-screen w-full text-white z-20 bg-[#1a130d] overflow-hidden select-text flex flex-col justify-center items-center py-20 sm:py-28 md:py-32"
  aria-label="About Me"
>
  <!-- ============================================== -->
  <!-- WebGL Grainient Background (from Svelte Bits)  -->
  <!-- ============================================== -->
  <div class="pointer-events-none absolute inset-0 w-full h-full z-0 overflow-hidden opacity-90">
    <Grainient
      color1="#ffb089"
      color2="#ff8a3d"
      color3="#ff3e00"
      timeSpeed={0.25}
      warpStrength={1}
      warpFrequency={5}
      warpSpeed={2}
      grainAmount={0.1}
      contrast={1.5}
      saturation={1}
      zoom={0.9}
      grainAnimated={false}
    />
  </div>

  <!-- Soft Ambient Tint: Protects text legibility while keeping fluid colors vibrant and glowing -->
  <div
    class="pointer-events-none absolute inset-0 bg-[#0c0805]/35 z-0"
    aria-hidden="true"
  ></div>

  <!-- Smooth top transition from previous #home section -->
  <div
    class="pointer-events-none absolute top-0 left-0 right-0 h-24 sm:h-36 bg-gradient-to-b from-[#1a130d] via-[#1a130d]/65 to-transparent z-0"
    aria-hidden="true"
  ></div>

  <!-- Smooth bottom transition into #skills section -->
  <div
    class="pointer-events-none absolute bottom-0 left-0 right-0 h-24 sm:h-36 bg-gradient-to-t from-[#1a130d] via-[#1a130d]/65 to-transparent z-0"
    aria-hidden="true"
  ></div>

  <!-- Subtle Radial Vignette for focused center contrast -->
  <div
    class="pointer-events-none absolute inset-0 bg-radial from-transparent via-[#120d08]/15 to-[#120d08]/50 z-0"
    aria-hidden="true"
  ></div>

  <!-- Viewport Content Container -->
  <div
    bind:this={contentWrapperRef}
    class="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-8 flex flex-col gap-14 md:gap-20"
  >
    <!-- ============================================== -->
    <!-- 1. ABOUT HEADER & BIO TEXT (Images 1, 2, 3)    -->
    <!-- ============================================== -->
    <div class="max-w-4xl mx-auto w-full">
      <BorderGlow
        edgeSensitivity={30}
        borderRadius={28}
        glowRadius={40}
        glowIntensity={1}
        coneSpread={25}
        animated={false}
        backgroundColor="transparent"
        colors={['#ff8a4c', '#ffc18a', '#f95610']}
        class="w-full p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-md bg-black/20 border border-white/10"
      >
        <div class="flex flex-col gap-6 text-left">
          <!-- Section Label (Img 2) -->
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-[#ff8c00] animate-pulse"></span>
            <span class="text-xs sm:text-sm font-mono font-bold tracking-[0.25em] text-[#ff8c00] uppercase">
              ABOUT ME
            </span>
          </div>

          <!-- Main Heading (Img 1 font style & Img 3 text) -->
          <h2
            class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ffdb58] to-[#ff8c00] leading-[1.18]"
          >
            Building, Automating, and Improving Systems.
          </h2>

          <!-- Four Detailed Bio Paragraphs (Img 3) -->
          <div class="space-y-4 sm:space-y-5 text-gray-300 font-sans text-sm sm:text-base md:text-[1.05rem] leading-relaxed">
            <p>
              I’m a final-year <strong class="font-bold text-white">Computer Science and Engineering student</strong> focused on DevOps, cloud infrastructure, automation, and modern software delivery.
            </p>

            <p>
              I enjoy designing and building reliable, scalable systems using technologies such as <strong class="font-bold text-white">Linux, Git, Docker, Jenkins, Kubernetes, Terraform, and AWS</strong>. My focus is on creating efficient <strong class="font-bold text-white">CI/CD pipelines</strong>, automating development and deployment workflows, and improving system reliability through monitoring and observability.
            </p>

            <p>
              Through hands-on projects and continuous learning, I’m developing practical experience across <strong class="font-bold text-white">cloud infrastructure, containerization, CI/CD, infrastructure as code, and DevOps automation</strong>.
            </p>

            <p>
              I’m passionate about turning development workflows into <strong class="font-bold text-white">automated, repeatable, and reliable systems</strong> while continuously exploring new technologies and engineering practices.
            </p>
          </div>

          <!-- Key Technologies & Focus Areas (Img 3) -->
          <div class="pt-2 flex flex-col gap-3.5">
            <h3 class="text-xs sm:text-sm font-mono font-bold uppercase tracking-[0.2em] text-white">
              Key Technologies &amp; Focus Areas
            </h3>

            <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {#each techBadges as badge}
                <span
                  class="about-tech-tag inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-mono text-gray-200 bg-[#161310]/90 border border-white/10 hover:border-[#ff8c00]/60 hover:text-[#ffdb58] transition-all duration-200 shadow-sm backdrop-blur-sm cursor-default select-none"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-[#ff8c00]"></span>
                  {badge}
                </span>
              {/each}
            </div>
          </div>
        </div>
      </BorderGlow>
    </div>

    <!-- ============================================== -->
    <!-- 2. EDUCATION SECTION (Matching Image 1 & 2)    -->
    <!-- ============================================== -->
    <div class="max-w-4xl mx-auto w-full flex flex-col gap-6 text-left">
      <!-- Title Header -->
      <div class="flex items-center gap-2.5">
        <span class="text-xl sm:text-2xl" aria-hidden="true">🎓</span>
        <h3 class="text-lg sm:text-xl font-mono font-bold tracking-wider text-white uppercase">
          EDUCATION
        </h3>
      </div>

      <!-- Cards Container (matching Image 2) -->
      <div class="flex flex-col gap-6 w-full">
        <!-- ============================================== -->
        <!-- CARD 1: DEGREE (B.E. CSE • 2023 — 2027)        -->
        <!-- ============================================== -->
        <GlareHover
          glareColor="#f58300"
          glareOpacity={0.5}
          glareSize={300}
          transitionDuration={800}
          playOnce={false}
          width="100%"
          height="auto"
          background="rgba(19, 14, 10, 0.9)"
          borderRadius="24px"
          borderColor="rgba(245, 131, 0, 0.35)"
          class="w-full shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-orange-500/70"
        >
          <div class="relative w-full p-5 sm:p-7 md:p-8 flex flex-col gap-5 sm:gap-6 overflow-hidden">
            <!-- Soft ambient orange light across top-right -->
            <div
              class="pointer-events-none absolute -right-16 -top-16 w-56 h-56 rounded-full bg-orange-500/15 blur-[70px]"
              aria-hidden="true"
            ></div>

            <!-- University Campus Building Watermark Illustration -->
            <div
              class="pointer-events-none absolute right-2 sm:right-6 top-8 sm:top-10 opacity-[0.14] text-orange-400 select-none"
              aria-hidden="true"
            >
              <svg
                class="w-36 h-36 sm:w-48 sm:h-48"
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
              >
                <!-- Pediment triangle roof -->
                <path d="M 50 16 L 88 34 L 12 34 Z" stroke-linejoin="round" />
                <!-- Flag pole & pennant -->
                <line x1="50" y1="16" x2="50" y2="7" />
                <path d="M 50 7 L 62 11.5 L 50 16 Z" fill="currentColor" fill-opacity="0.2" />
                <!-- Entablature bar -->
                <rect x="15" y="34" width="70" height="5" rx="1" />
                <!-- Columns -->
                <rect x="20" y="39" width="6" height="35" rx="0.5" />
                <rect x="34" y="39" width="6" height="35" rx="0.5" />
                <rect x="60" y="39" width="6" height="35" rx="0.5" />
                <rect x="74" y="39" width="6" height="35" rx="0.5" />
                <!-- Center arch / door -->
                <path d="M 46 74 V 52 H 54 V 74" />
                <!-- Windows on left & right wings -->
                <rect x="27" y="47" width="5" height="9" rx="0.5" />
                <rect x="68" y="47" width="5" height="9" rx="0.5" />
                <!-- Base foundation steps -->
                <rect x="10" y="74" width="80" height="4" rx="1" />
                <rect x="6" y="78" width="88" height="5" rx="1" />
              </svg>
            </div>

            <!-- Top Row: DEGREE on left, 2023 — 2027 & IN PROGRESS on right -->
            <div class="relative z-10 flex items-center justify-between flex-wrap gap-2.5">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-orange-500"></span>
                <span class="font-mono text-xs uppercase tracking-[0.25em] text-zinc-400 font-bold">
                  DEGREE
                </span>
              </div>

              <!-- Badges: Academic Year + In Progress -->
              <div class="flex items-center gap-2">
                <!-- 2023 — 2027 Badge -->
                <div class="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-black/60 px-3.5 py-1 backdrop-blur-sm">
                  <span class="font-mono text-xs font-bold text-orange-300 tracking-wider">
                    2023 — 2027
                  </span>
                </div>

                <!-- IN PROGRESS Badge (Green Pulsing Dot + Orange Text) -->
                <div class="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-black/60 px-3.5 py-1 backdrop-blur-sm">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
                  <span class="font-mono text-xs uppercase tracking-wider text-orange-400 font-bold">
                    IN PROGRESS
                  </span>
                </div>
              </div>
            </div>

            <!-- Degree Title & Institute Details with Left Orange Bar -->
            <div class="relative z-10 flex items-stretch gap-3.5 sm:gap-4">
              <!-- Left Accent Bar -->
              <div class="w-1 rounded-full bg-orange-500 flex-shrink-0"></div>

              <!-- Content -->
              <div class="flex flex-col gap-1.5">
                <h4 class="text-xl sm:text-2xl md:text-[1.65rem] font-black uppercase tracking-tight text-white font-sans leading-tight">
                  B.E. COMPUTER SCIENCE &amp; ENGINEERING
                </h4>

                <div class="flex items-center gap-2 text-zinc-300 text-sm sm:text-base font-sans font-medium mt-1">
                  <svg class="w-4 h-4 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Mount Zion College of Engineering and Technology</span>
                </div>

                <div class="flex items-center gap-2 text-zinc-400 text-xs sm:text-sm font-sans">
                  <svg class="w-4 h-4 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Pudukkottai</span>
                </div>
              </div>
            </div>

            <!-- 3 Stat Metric Cards Grid -->
            <div class="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
              <!-- Stat 1: FINAL YEAR 04 -->
              <div class="rounded-2xl border border-white/10 bg-black/40 p-3.5 sm:p-4 flex items-center gap-3.5 backdrop-blur-sm hover:border-orange-500/35 transition-all">
                <div class="w-11 h-11 rounded-xl border border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-orange-400 flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="flex flex-col">
                  <span class="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                    FINAL YEAR
                  </span>
                  <span class="font-mono text-xl sm:text-2xl font-black text-white">
                    04
                  </span>
                </div>
              </div>

              <!-- Stat 2: CGPA 7.40 / 10 -->
              <div class="rounded-2xl border border-white/10 bg-black/40 p-3.5 sm:p-4 flex items-center gap-3.5 backdrop-blur-sm hover:border-orange-500/35 transition-all">
                <div class="w-11 h-11 rounded-xl border border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-orange-400 flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div class="flex flex-col">
                  <span class="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                    CGPA
                  </span>
                  <span class="font-mono text-xl sm:text-2xl font-black text-orange-400">
                    7.40 / 10
                  </span>
                </div>
              </div>

              <!-- Stat 3: ENGINEERING CSE -->
              <div class="rounded-2xl border border-white/10 bg-black/40 p-3.5 sm:p-4 flex items-center gap-3.5 backdrop-blur-sm hover:border-orange-500/35 transition-all">
                <div class="w-11 h-11 rounded-xl border border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-orange-400 flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div class="flex flex-col">
                  <span class="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                    ENGINEERING
                  </span>
                  <span class="font-mono text-xl sm:text-2xl font-black text-white">
                    CSE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </GlareHover>

        <!-- ============================================== -->
        <!-- CARD 2: CLASS XII (Higher Secondary • MAR 2023)-->
        <!-- ============================================== -->
        <GlareHover
          glareColor="#f58300"
          glareOpacity={0.5}
          glareSize={300}
          transitionDuration={800}
          playOnce={false}
          width="100%"
          height="auto"
          background="rgba(19, 14, 10, 0.9)"
          borderRadius="24px"
          borderColor="rgba(245, 131, 0, 0.35)"
          class="w-full shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-orange-500/70"
        >
          <div class="relative w-full p-5 sm:p-7 md:p-8 flex flex-col gap-5 sm:gap-6 overflow-hidden">
            <!-- Ambient soft glow -->
            <div
              class="pointer-events-none absolute -right-16 -top-16 w-56 h-56 rounded-full bg-orange-500/15 blur-[70px]"
              aria-hidden="true"
            ></div>

            <!-- Open Book Watermark Illustration -->
            <div
              class="pointer-events-none absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 opacity-[0.14] text-orange-400 select-none"
              aria-hidden="true"
            >
              <svg
                class="w-28 h-28 sm:w-36 sm:h-36"
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
              >
                <path d="M 50 30 C 40 22 25 22 15 25 V 75 C 25 72 40 72 50 80 C 60 72 75 72 85 75 V 25 C 75 22 60 22 50 30 Z" stroke-linejoin="round" />
                <line x1="50" y1="30" x2="50" y2="80" />
                <line x1="22" y1="38" x2="42" y2="40" stroke-dasharray="2 2" />
                <line x1="22" y1="48" x2="42" y2="50" stroke-dasharray="2 2" />
                <line x1="22" y1="58" x2="42" y2="60" stroke-dasharray="2 2" />
                <line x1="58" y1="40" x2="78" y2="38" stroke-dasharray="2 2" />
                <line x1="58" y1="50" x2="78" y2="48" stroke-dasharray="2 2" />
                <line x1="58" y1="60" x2="78" y2="58" stroke-dasharray="2 2" />
              </svg>
            </div>

            <!-- Top Row: CLASS XII + MAR 2023 Badge -->
            <div class="relative z-10 flex items-center justify-between flex-wrap gap-2.5">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-orange-500"></span>
                <span class="font-mono text-xs uppercase tracking-[0.25em] text-zinc-400 font-bold">
                  CLASS XII
                </span>
              </div>

              <!-- Academic Year Badge: MAR 2023 -->
              <div class="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-black/60 px-3.5 py-1 backdrop-blur-sm">
                <span class="w-2 h-2 rounded-full bg-orange-400"></span>
                <span class="font-mono text-xs uppercase tracking-wider text-orange-400 font-bold">
                  MAR 2023
                </span>
              </div>
            </div>

            <!-- Main Content: Left details + Right Performance box -->
            <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
              <!-- Left Details -->
              <div class="flex items-stretch gap-3.5 sm:gap-4">
                <!-- Left Accent Bar -->
                <div class="w-1 rounded-full bg-orange-500 flex-shrink-0"></div>

                <div class="flex flex-col gap-1.5">
                  <h4 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-sans leading-tight">
                    Higher Secondary Education
                  </h4>

                  <!-- School Name: Maharishi Vidya Mandir School -->
                  <div class="flex items-center gap-2 text-zinc-300 text-sm sm:text-base font-sans font-medium mt-1">
                    <svg class="w-4 h-4 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Maharishi Vidya Mandir School</span>
                  </div>

                  <!-- Location & Class: Karaikudi • Class XII -->
                  <div class="flex items-center gap-3 text-zinc-400 text-xs sm:text-sm font-sans flex-wrap">
                    <div class="flex items-center gap-1.5">
                      <svg class="w-4 h-4 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Karaikudi</span>
                    </div>
                    <span class="text-zinc-600">•</span>
                    <div class="flex items-center gap-1.5">
                      <svg class="w-4 h-4 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>Class XII</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Performance Card (matching Image 1) -->
              <div class="rounded-2xl border border-white/10 bg-black/45 p-4 sm:p-5 flex flex-col gap-3 backdrop-blur-sm min-w-[260px] sm:min-w-[320px]">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                    PERFORMANCE
                  </span>
                  <span class="font-mono text-xl sm:text-2xl font-black text-orange-400">
                    63.67%
                  </span>
                </div>

                <!-- Glowing Gradient Progress Bar -->
                <div class="w-full h-3.5 rounded-full bg-zinc-800/80 border border-white/10 overflow-hidden p-0.5 flex">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 shadow-[0_0_12px_rgba(255,122,0,0.65)] transition-all duration-1000"
                    style="width: 63.67%;"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </GlareHover>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- 3. EXPERIENCE & RECOGNITION (3D CoverFlow)     -->
    <!-- ============================================== -->
    <div class="w-full">
      <ExperienceCoverflow
        onViewCertificate={(item) => (activeCertModal = item)}
        class="w-full"
      />
    </div>

    <!-- Bottom Circular Scroll Indicator to Skills -->
    <div class="flex justify-center pt-2">
      <a
        href="#skills"
        class="w-10 h-10 rounded-full border border-white/30 bg-black/40 hover:border-[#ff8c00] flex items-center justify-center text-gray-300 hover:text-[#ffdb58] transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-md shadow-black/50"
        aria-label="Scroll to Skills"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </a>
    </div>
  </div>

  <!-- Certificate Preview Modal -->
  {#if activeCertModal}
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl transition-all duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="Certificate Viewer: {activeCertModal.title}"
      tabindex="-1"
      onkeydown={(e) => e.key === "Escape" && (activeCertModal = null)}
    >
      <!-- Backdrop Click to Close -->
      <button
        type="button"
        class="absolute inset-0 w-full h-full cursor-default bg-transparent border-none p-0 m-0"
        onclick={() => (activeCertModal = null)}
        aria-label="Close modal overlay"
      ></button>

      <div
        class="relative max-w-4xl w-full max-h-[92vh] bg-[#140f0b]/98 border border-orange-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(255,122,0,0.22)] text-left flex flex-col z-10 overflow-hidden backdrop-blur-2xl font-sans"
      >
        <!-- Modal Ambient Glow -->
        <div
          class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/20 blur-[80px]"
          aria-hidden="true"
        ></div>

        <!-- Header -->
        <div class="relative z-10 flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div class="flex flex-col gap-1.5 min-w-0">
            <!-- Badges -->
            <div class="flex items-center gap-2 flex-wrap">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Official Credential
              </span>

              <span class="font-mono text-[10px] uppercase tracking-wider text-orange-400 font-bold px-2 py-0.5 rounded-full border border-orange-500/30 bg-orange-500/10">
                {activeCertModal.type.toUpperCase()}
              </span>

              <span class="font-mono text-xs text-zinc-500">
                {activeCertModal.year}
              </span>
            </div>

            <!-- Title & Institution -->
            <h3 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-sans truncate">
              {activeCertModal.title}
            </h3>

            <p class="text-xs sm:text-sm text-zinc-300 font-medium font-sans flex items-center gap-2">
              <span class="text-orange-400">🏛</span>
              <span>{activeCertModal.organization}</span>
              {#if activeCertModal.duration}
                <span class="text-zinc-600 hidden sm:inline">•</span>
                <span class="text-zinc-400 hidden sm:inline font-mono text-xs">{activeCertModal.duration}</span>
              {:else if activeCertModal.date}
                <span class="text-zinc-600 hidden sm:inline">•</span>
                <span class="text-zinc-400 hidden sm:inline font-mono text-xs">{activeCertModal.date}</span>
              {/if}
            </p>
          </div>

          <!-- Header Actions -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- Open Full Original in New Tab -->
            <a
              href={activeCertModal.certFile}
              target="_blank"
              rel="noopener noreferrer"
              class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 hover:text-white font-mono text-xs font-bold transition-all"
              title="Open full size in new browser tab"
            >
              <span>Open Original</span>
              <span aria-hidden="true">↗</span>
            </a>

            <!-- Download Button -->
            <a
              href={activeCertModal.certFile}
              download
              class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 bg-black/40 hover:border-orange-500/50 text-zinc-300 hover:text-white font-mono text-xs font-bold transition-all"
              title="Download file"
            >
              <span>Download</span>
              <span aria-hidden="true">📥</span>
            </a>

            <!-- Close Button -->
            <button
              type="button"
              onclick={() => (activeCertModal = null)}
              class="w-8 h-8 rounded-xl border border-white/20 bg-black/40 hover:border-orange-500/50 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Main Certificate Preview Area -->
        <div class="relative z-10 flex-1 min-h-0 overflow-y-auto my-4 flex items-center justify-center p-1 sm:p-2">
          {#if activeCertModal.fileType === "image"}
            <div class="relative w-full max-h-[58vh] flex items-center justify-center group/preview">
              <a
                href={activeCertModal.certFile}
                target="_blank"
                rel="noopener noreferrer"
                class="block relative max-h-[58vh] rounded-2xl overflow-hidden border border-orange-500/30 bg-black shadow-2xl transition-transform hover:scale-[1.01]"
                title="Click to view full image in new tab"
              >
                <img
                  src={activeCertModal.certFile}
                  alt={activeCertModal.certName}
                  class="w-full max-h-[56vh] object-contain rounded-2xl"
                  loading="eager"
                />
                <div class="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-mono text-[10px] text-zinc-300 opacity-80 group-hover/preview:opacity-100 transition-opacity">
                  Click to view full resolution ↗
                </div>
              </a>
            </div>
          {:else}
            <!-- PDF Viewer -->
            <div class="w-full h-[58vh] min-h-[420px] rounded-2xl border border-orange-500/30 overflow-hidden bg-black/60 shadow-2xl flex flex-col">
              <iframe
                src="{activeCertModal.certFile}#toolbar=1"
                title={activeCertModal.certName}
                class="w-full flex-1 border-none bg-zinc-900"
              ></iframe>
            </div>
          {/if}
        </div>

        <!-- Footer Strip -->
        <div class="relative z-10 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3 text-zinc-400 font-mono text-[11px]">
            <span class="text-zinc-500">RECIPIENT:</span>
            <span class="text-white font-bold tracking-wide">M.S. SUDARSHNA CHAND</span>
            <span class="text-zinc-700 hidden sm:inline">•</span>
            <span class="text-emerald-400 hidden sm:inline font-bold">100% VERIFIED RECORD</span>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
            <!-- Mobile Actions -->
            <a
              href={activeCertModal.certFile}
              target="_blank"
              rel="noopener noreferrer"
              class="sm:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-orange-500/40 bg-orange-500/10 text-orange-300 font-mono text-xs font-bold"
            >
              Open ↗
            </a>
            <a
              href={activeCertModal.certFile}
              download
              class="sm:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/20 bg-black/40 text-zinc-300 font-mono text-xs font-bold"
            >
              Download
            </a>

            <button
              type="button"
              onclick={() => (activeCertModal = null)}
              class="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-orange-500/20 active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</section>

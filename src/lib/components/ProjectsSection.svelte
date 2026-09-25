<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import FaultyTerminal from './FaultyTerminal.svelte';
  import ElectricBorder from './ElectricBorder.svelte';
  import ScrambledText from './ScrambledText.svelte';

  // Import tool logos
  import gitSvg from '../assets/logos/svg/git.svg';
  import githubSvg from '../assets/logos/svg/github.svg';
  import jenkinsWebp from '../assets/logos/webp/Jenkins_logo.svg.webp';
  import dockerSvg from '../assets/logos/svg/docker.svg';
  import kubernetesSvg from '../assets/logos/svg/kubernetes.svg';
  import terraformSvg from '../assets/logos/svg/HashiCorp Terraform.svg';
  import prometheusWebp from '../assets/logos/webp/Prometheus_software_logo.svg.webp';
  import grafanaSvg from '../assets/logos/svg/grafana.svg';
  import pythonSvg from '../assets/logos/svg/python-svgrepo-com.svg';
  import ec2Svg from '../assets/logos/svg/EC2.svg';
  import linuxSvg from '../assets/logos/svg/linux.svg';
  import githubActionsSvg from '../assets/logos/svg/Github-Actions--Streamline-Svg-Logos.svg';
  import cloudflareSvg from '../assets/logos/svg/cloudflare.svg';

  import { portfolioStore } from '../data/portfolioStore.svelte';

  const toolLogos: Record<string, { icon: string; invertDark?: boolean }> = {
    git: { icon: gitSvg },
    github: { icon: githubSvg, invertDark: true },
    jenkins: { icon: jenkinsWebp },
    docker: { icon: dockerSvg },
    'docker hub': { icon: dockerSvg },
    kubernetes: { icon: kubernetesSvg },
    k8s: { icon: kubernetesSvg },
    terraform: { icon: terraformSvg },
    prometheus: { icon: prometheusWebp },
    grafana: { icon: grafanaSvg },
    python: { icon: pythonSvg },
    'python flask': { icon: pythonSvg },
    flask: { icon: pythonSvg },
    cloudflare: { icon: cloudflareSvg },
    'cloudflare tunnel': { icon: cloudflareSvg },
    'aws ec2': { icon: ec2Svg },
    ec2: { icon: ec2Svg },
    aws: { icon: ec2Svg },
    linux: { icon: linuxSvg },
    'ci/cd': { icon: githubActionsSvg },
    'github actions': { icon: githubActionsSvg }
  };

  function getToolIcon(tool: { name: string; icon?: string }): string | undefined {
    if (tool.icon && typeof tool.icon === 'string' && tool.icon.trim().length > 5 && !tool.icon.includes('undefined')) {
      return tool.icon;
    }
    const key = tool.name.toLowerCase().trim();
    return toolLogos[key]?.icon || undefined;
  }

  function isToolInvertDark(tool: { name: string; icon?: string; invertDark?: boolean }): boolean {
    if (typeof tool.invertDark === 'boolean') return tool.invertDark;
    const key = tool.name.toLowerCase().trim();
    return toolLogos[key]?.invertDark ?? false;
  }

  type Props = {
    scrollContainer?: HTMLElement | null;
  };

  let { scrollContainer = null }: Props = $props();

  let projects = $derived(portfolioStore.projects);

  let sectionRef = $state<HTMLElement | null>(null);
  let cardRefs = $state<(HTMLDivElement | null)[]>([]);

  onMount(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      cardRefs.forEach((card) => {
        if (card) {
          card.style.opacity = '1';
          card.style.transform = 'none';
        }
      });
      return;
    }

    // Scroll animation for each rectangle card one by one
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            gsap.fromTo(
              target,
              { opacity: 0, y: 36, scale: 0.97 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.85,
                ease: 'power3.out'
              }
            );
            observer.unobserve(target);
          }
        });
      },
      {
        threshold: 0.15,
        root: scrollContainer || null
      }
    );

    cardRefs.forEach((card) => {
      if (card) {
        card.style.opacity = '0';
        observer.observe(card);
      }
    });

    return () => {
      observer.disconnect();
    };
  });
</script>

<section
  id="projects"
  bind:this={sectionRef}
  class="relative min-h-screen w-full text-white z-20 bg-[#1a130d] overflow-hidden py-24 md:py-32 flex flex-col justify-center items-center select-text"
  aria-label="Featured Projects"
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

  <!-- Gradient overlays for maximum content clarity -->
  <div
    class="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1a130d]/90 via-[#1a130d]/65 to-[#1a130d]/95 z-0"
    aria-hidden="true"
  ></div>

  <!-- Soft Ambient Glow behind projects -->
  <div
    class="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#ff8c00]/15 via-[#ffdb58]/5 to-transparent blur-[110px] rounded-full z-0"
    aria-hidden="true"
  ></div>

  <div class="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-8">
    <!-- Section Header -->
    <div class="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
      <div class="inline-flex items-center gap-2 mb-3">
        <span class="w-2 h-2 rounded-full bg-[#ff8c00] animate-pulse"></span>
        <span class="text-xs font-mono font-bold tracking-[0.25em] text-[#ff8c00] uppercase select-none">
          PROJECTS SHOWCASE
        </span>
      </div>
      <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ffdb58] to-[#ff8c00] mb-4 font-sans">
        Featured Projects
      </h2>
      <ScrambledText
        as="p"
        radius={100}
        duration={1.2}
        speed={0.5}
        scrambleChars=".:"
        className="text-gray-300 text-sm sm:text-base leading-relaxed font-sans max-w-xl mx-auto cursor-default"
      >
        Production-grade CI/CD pipelines, container orchestration, and automated cloud deployments.
      </ScrambledText>
    </div>

    <!-- One-by-one Rectangle Cards with Electric Border -->
    <div class="flex flex-col gap-10 sm:gap-14 w-full">
      {#each projects as project, index (project.id)}
        <div
          bind:this={cardRefs[index]}
          class="project-rectangle-item w-full transition-transform duration-300"
        >
          <ElectricBorder
            color="#ff8c00"
            borderRadius={24}
            speed={1.1}
            chaos={0.12}
            className="w-full shadow-[0_15px_45px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_55px_rgba(255,140,0,0.22)] transition-shadow duration-300"
          >
            <!-- Card Content Container -->
            <div class="relative p-6 sm:p-8 md:p-10 rounded-[24px] bg-[#14110e]/92 border border-white/10 backdrop-blur-md flex flex-col justify-between">
              
              <!-- Card Header: Number, Tag, Live Indicator -->
              <div class="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6 border-b border-white/10 pb-4">
                <div class="flex items-center gap-3">
                  <span class="text-xs sm:text-sm font-mono font-bold text-[#ff8c00] bg-[#ff8c00]/15 px-2.5 py-1 rounded-md border border-[#ff8c00]/30 select-none">
                    {project.number}
                  </span>
                  <span class="text-xs sm:text-sm font-mono tracking-wider text-[#ffdb58] font-semibold uppercase">
                    {project.tag}
                  </span>
                </div>

                <div class="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span class="text-[11px] font-mono text-emerald-300 font-medium tracking-wide uppercase select-none">Production Ready</span>
                </div>
              </div>

              <!-- Project Title with ScrambledText interactive effect (given settings) -->
              <div class="mb-6">
                <ScrambledText
                  as="h3"
                  radius={100}
                  duration={1.2}
                  speed={0.5}
                  scrambleChars=".:"
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug group-hover:text-[#ffdb58] transition-colors cursor-default"
                >
                  {project.title}
                </ScrambledText>
              </div>

              <!-- Project Highlights (Bullet Points with ScrambledText given settings) -->
              <div class="space-y-3.5 sm:space-y-4 mb-8">
                {#each project.bullets as bullet, bIndex (bIndex)}
                  <div class="flex items-start gap-3 group/bullet">
                    <span class="text-[#ff8c00] font-mono text-sm sm:text-base leading-relaxed shrink-0 mt-0.5 select-none" aria-hidden="true">
                      ▸
                    </span>
                    <div class="text-gray-300 text-sm sm:text-[0.95rem] leading-relaxed flex-1 font-sans">
                      <ScrambledText
                        as="p"
                        radius={100}
                        duration={1.2}
                        speed={0.5}
                        scrambleChars=".:"
                        className="text-gray-300 text-sm sm:text-[0.95rem] leading-relaxed font-sans cursor-default"
                      >
                        {bullet}
                      </ScrambledText>
                    </div>
                  </div>
                {/each}
              </div>

              <!-- Tools & Technologies (Small Icons placed alongside names) -->
              <div class="pt-5 border-t border-white/10 flex flex-col gap-3 text-left">
                <div class="flex items-center gap-2">
                  <span class="text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] text-gray-400 uppercase select-none">
                    TOOLS & TECHNOLOGIES
                  </span>
                </div>

                <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  {#each project.tools as tool (tool.name)}
                    <span
                      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono text-gray-200 bg-black/50 border border-white/10 hover:border-[#ff8c00]/60 hover:text-[#ffdb58] hover:bg-black/70 hover:scale-105 transition-all duration-200 shadow-sm backdrop-blur-sm cursor-default select-none group/tool"
                    >
                      {#if getToolIcon(tool)}
                        <img
                          src={getToolIcon(tool)}
                          alt={tool.name}
                          class="w-4 h-4 object-contain shrink-0 transition-transform duration-200 group-hover/tool:scale-110 {isToolInvertDark(tool) ? 'brightness-0 invert' : ''}"
                          loading="lazy"
                          onerror={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      {/if}
                      <span class="font-medium">{tool.name}</span>
                    </span>
                  {/each}
                </div>
              </div>

            </div>
          </ElectricBorder>
        </div>
      {/each}
    </div>
  </div>
</section>

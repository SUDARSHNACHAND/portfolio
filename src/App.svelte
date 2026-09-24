<script lang="ts">
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  gsap.registerPlugin(ScrollTrigger);
  import FloatingLines from "./lib/components/FloatingLines.svelte";
  import ClickSpark from "./lib/components/ClickSpark.svelte";
  import PillNav from "./lib/components/PillNav.svelte";
  import DecryptedText from "./lib/components/DecryptedText.svelte";
  import TargetCursor from "./lib/components/TargetCursor.svelte";
  import BorderGlow from "./lib/components/BorderGlow.svelte";
  import Admin2FAModal from "./lib/components/Admin2FAModal.svelte";
  import AdminPage from "./lib/components/AdminPage.svelte";
  import Aurora from "./lib/components/Aurora.svelte";
  import { portfolioStore } from "./lib/data/portfolioStore.svelte";
  import TerminalTyping from "./lib/components/TerminalTyping.svelte";
  import DownloadResumeButton from "./lib/components/DownloadResumeButton.svelte";
  import AboutSection from "./lib/components/AboutSection.svelte";
  import ProjectsSection from "./lib/components/ProjectsSection.svelte";
  import FaultyTerminal from "./lib/components/FaultyTerminal.svelte";
  import DotField from "./lib/components/DotField.svelte";
  import { saveInquiryToSupabase } from "./lib/supabaseClient";
  import { playNavClickSound } from "./lib/utils/sound";
  import svelteLogo from "./assets/svelte.svg";
  import { skillCategories } from "./lib/data/logos";
  import gmailIcon from "./lib/assets/contact/gmail.png";
  import linkedinIcon from "./lib/assets/contact/linkedin.png";
  import githubIcon from "./lib/assets/contact/github-light.svg";
  import instagramIcon from "./lib/assets/contact/instagram.png";
  import facebookIcon from "./lib/assets/contact/facebook.png";
  import Lenis from "lenis";
  import "lenis/dist/lenis.css";
  import spidermanVideo from "./lib/assets/contact/spiderman.mp4";

  const heroSocialLinks = [
    {
      id: "gmail",
      name: "Gmail",
      icon: gmailIcon,
      href: "mailto:sudarshanachand007@gmail.com",
      external: false
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: linkedinIcon,
      href: "https://www.linkedin.com/in/sudarshna-chand-m-s-8a8917291",
      external: true
    },
    {
      id: "github",
      name: "GitHub",
      icon: githubIcon,
      href: "https://github.com/SUDARSHNACHAND",
      external: true
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: instagramIcon,
      href: "https://www.instagram.com/sudarshan__ms/",
      external: true
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: facebookIcon,
      href: "https://www.facebook.com/sudarshana.sudarshana.31508/",
      external: true
    }
  ];

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" }
  ];

  let activeHref = $state("#home");
  let isAdminModalOpen = $state(false);

  // Dynamic Routing for /admin or #admin
  let currentPath = $state(typeof window !== "undefined" ? window.location.pathname : "/");
  let currentHash = $state(typeof window !== "undefined" ? window.location.hash : "");

  let isAdminRoute = $derived(
    currentPath === "/admin" || 
    currentPath.startsWith("/admin/") || 
    currentHash === "#admin"
  );

  function navigateTo(path: string) {
    if (typeof window !== "undefined") {
      history.pushState(null, "", path);
      currentPath = window.location.pathname;
      currentHash = window.location.hash;
    }
  }

  let heroContainer = $state<HTMLDivElement | null>(null);

  let mainScrollWrapper = $state<HTMLDivElement | null>(null);
  let mainScrollContent = $state<HTMLDivElement | null>(null);
  let lenisInstance = $state<Lenis | null>(null);

  // Real-time contact form state
  let contactName = $state("");
  let contactEmail = $state("");
  let contactMessage = $state("");
  let isContactSending = $state(false);
  let contactSuccess = $state(false);
  let contactError = $state<string | null>(null);

  function scrollToSection(href: string, e?: MouseEvent) {
    if (e) e.preventDefault();
    const id = href.replace("#", "");
    const target = document.getElementById(id);
    if (!target) return;

    activeHref = href;
    history.replaceState(null, "", href);

    if (lenisInstance) {
      lenisInstance.scrollTo(target, { duration: 1.2, offset: 0 });
    } else if (mainScrollWrapper) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  async function handleContactSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (isContactSending) return;

    playNavClickSound(4);
    contactError = null;
    contactSuccess = false;

    const trimmedName = contactName.trim();
    const trimmedEmail = contactEmail.trim();
    const trimmedMessage = contactMessage.trim();

    if (!trimmedName || trimmedName.length < 2) {
      contactError = "Please enter your name (at least 2 characters).";
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      contactError = "Please enter a valid email address.";
      return;
    }
    if (!trimmedMessage || trimmedMessage.length < 5) {
      contactError = "Please enter a message (at least 5 characters).";
      return;
    }

    isContactSending = true;

    try {
      const web3FormsKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "c65c4fa6-874c-4017-b368-c46f5210c587";
      let sentSuccessfully = false;
      let lastErrorMessage = "";

      if (web3FormsKey) {
        try {
          const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify({
              access_key: web3FormsKey,
              name: trimmedName,
              email: trimmedEmail,
              message: trimmedMessage,
              subject: `New Portfolio Contact from ${trimmedName}`,
              from_name: "Portfolio Contact",
              replyto: trimmedEmail
            })
          });

          const data = await res.json();
          if (res.ok && data.success) {
            sentSuccessfully = true;
          } else {
            lastErrorMessage = data.message || "Web3Forms submission failed";
          }
        } catch (wErr) {
          lastErrorMessage = wErr instanceof Error ? wErr.message : "Network error";
        }
      }

      if (!sentSuccessfully) {
        // Fallback to local /api/contact endpoint
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            message: trimmedMessage
          })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || lastErrorMessage || "Unable to send message. Please try again.");
        }
      }

      contactSuccess = true;
      portfolioStore.addInquiry({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage
      });
      // Store inquiry in Supabase database:
      saveInquiryToSupabase({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage
      }).catch((e) => console.warn("Supabase background save:", e));
      contactName = "";
      contactEmail = "";
      contactMessage = "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to send message. Please try again.";
      contactError = msg;
    } finally {
      isContactSending = false;
    }
  }

  $effect(() => {
    if (mainScrollWrapper && mainScrollContent) {
      const lenis = new Lenis({
        wrapper: mainScrollWrapper,
        content: mainScrollContent,
        eventsTarget: mainScrollWrapper,
        smoothWheel: true,
        lerp: 0.08,
        syncTouch: true
      });
      lenisInstance = lenis;

      lenis.on("scroll", () => {
        ScrollTrigger.update();
      });

      let frameId: number;
      const raf = (time: number) => {
        lenis.raf(time);
        ScrollTrigger.update();
        frameId = requestAnimationFrame(raf);
      };
      frameId = requestAnimationFrame(raf);

      return () => {
        cancelAnimationFrame(frameId);
        lenis.destroy();
        lenisInstance = null;
      };
    }
  });

  onMount(() => {
    // Initial hero items animation
    if (heroContainer) {
      const items = heroContainer.querySelectorAll(".hero-animate-item");
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: "power3.out" }
        );
      }
    }

    // IntersectionObserver to connect and track the active section during scroll
    const sectionIds = ["home", "about", "skills", "projects", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        }
        if (bestEntry && bestEntry.target.id) {
          activeHref = `#${bestEntry.target.id}`;
          history.replaceState(null, "", `#${bestEntry.target.id}`);
        }
      },
      {
        root: mainScrollWrapper,
        threshold: [0.15, 0.35, 0.6]
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Handle initial hash in URL
    const hash = window.location.hash;
    if (hash) {
      const targetHash = hash === "#work" ? "#skills" : hash;
      setTimeout(() => {
        scrollToSection(targetHash);
      }, 250);
    }

    const onLocationChange = () => {
      currentPath = window.location.pathname;
      currentHash = window.location.hash;
      if (currentHash && currentHash !== "#admin") {
        scrollToSection(currentHash === "#work" ? "#skills" : currentHash);
      }
    };
    window.addEventListener("hashchange", onLocationChange);
    window.addEventListener("popstate", onLocationChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", onLocationChange);
      window.removeEventListener("popstate", onLocationChange);
    };
  });
</script>

{#if isAdminRoute}
  <AdminPage onBack={() => navigateTo("/")} />
{:else}
  <!-- Global Cursor Target indicator -->
  <TargetCursor targetSelector=".cursor-target" color="#ff8c00" />

  <main class="relative w-full h-screen bg-[#1a130d] overflow-hidden flex flex-col justify-between">
    <!-- NAVIGATION (Pinned Fixed at Top of Viewport) -->
    <div class="fixed top-6 md:top-8 w-full flex justify-center z-50 pointer-events-none">
      <div class="pointer-events-auto flex justify-center w-full px-4">
        <PillNav 
          logo={svelteLogo} 
          logoAlt="Svelte"
          items={navItems} 
          {activeHref}
          baseColor="rgba(255, 255, 255, 0.1)"
          pillColor="transparent"
          pillTextColor="#ffffff"
          hoveredPillTextColor="#ffffff"
          onLogoClick={() => (isAdminModalOpen = true)}
          onItemClick={(href, idx, e) => scrollToSection(href, e)}
        />
      </div>
    </div>

    <!-- ADMIN 2FA 6-DIGIT AUTHENTICATION MODAL -->
    <Admin2FAModal 
      isOpen={isAdminModalOpen} 
      onClose={() => (isAdminModalOpen = false)} 
      onGoToAdminPage={() => {
        isAdminModalOpen = false;
        navigateTo("/admin");
      }}
    />

  <!-- CLICK SPARK WRAPPER AROUND CONTINUOUS SINGLE-PAGE SCROLL -->
  <ClickSpark
    sparkColor="#ffdb58"
    sparkSize={10}
    sparkRadius={10}
    sparkCount={8}
    duration={400}
  >
    <!-- CONNECTED CONTINUOUS SCROLL CONTAINER -->
    <div 
      bind:this={mainScrollWrapper}
      class="relative w-full h-screen overflow-y-auto overflow-x-hidden skills-scrollbar scroll-smooth"
    >
      <div bind:this={mainScrollContent} class="w-full flex flex-col">

        <!-- ============================================== -->
        <!-- 1. HOME SECTION                                -->
        <!-- ============================================== -->
        <section id="home" class="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-[#1a130d]">
          <!-- FloatingLines Background -->
          <div class="absolute inset-0 w-full h-full pointer-events-none z-0">
            <FloatingLines
              animationSpeed={1}
              linesGradient={["#ffffff", "#ffdb58", "#ff8c00", "#ff4500", "#cc3300"]}
            />
          </div>

          <!-- Hero Content -->
          <div 
            bind:this={heroContainer}
            class="relative z-20 flex flex-col items-center justify-center pointer-events-none px-4 text-center select-none pt-24 pb-16 w-full"
          >
            <div class="pointer-events-auto flex flex-col items-center max-w-4xl w-full">
              <!-- HI, I AM -->
              <span class="hero-animate-item text-xs sm:text-sm md:text-base font-mono font-bold tracking-[0.3em] text-[#ff8c00] uppercase mb-2 sm:mb-3">
                {portfolioStore.hero.greeting}
              </span>

              <!-- SUDARSHNA CHAND M S -->
              <h1 class="hero-animate-item text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[1.08] mb-2 sm:mb-3 font-sans">
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ffdb58] to-[#ff8c00] drop-shadow-[0_4px_25px_rgba(255,140,0,0.25)]">
                  {portfolioStore.hero.name}
                </span>
              </h1>

              <!-- DevOps Engineer -->
              <p class="hero-animate-item text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-200 tracking-wide mb-6 sm:mb-8">
                {portfolioStore.hero.role}
              </p>

              <!-- Dynamic Typing/Deleting DevOps Statement -->
              <div class="hero-animate-item flex justify-center w-full">
                <TerminalTyping />
              </div>

              <!-- Social Icons -->
              <div class="hero-animate-item flex items-center justify-center gap-5 sm:gap-6 md:gap-7 mt-6 sm:mt-7">
                {#each heroSocialLinks as link (link.id)}
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    aria-label={link.name}
                    title={link.name}
                    onclick={() => playNavClickSound(2)}
                    class="group inline-flex items-center justify-center transition-all duration-200 hover:scale-125 active:scale-95 cursor-pointer"
                  >
                    <img
                      src={link.icon}
                      alt={link.name}
                      class="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-all duration-200 group-hover:brightness-125 group-hover:drop-shadow-[0_0_16px_rgba(255,140,0,0.6)]"
                      loading="lazy"
                    />
                  </a>
                {/each}
              </div>

              <!-- Primary CTAs: Let's Talk → & Resume Download (Smooth Scrolls / Downloads) -->
              <div class="hero-animate-item flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mt-6 sm:mt-8 w-full max-w-xs sm:max-w-none mx-auto">
                <a
                  href="#contact"
                  onclick={(e) => {
                    playNavClickSound(4);
                    scrollToSection("#contact", e);
                  }}
                  class="group relative inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base text-black bg-gradient-to-r from-[#ffdb58] via-[#ff8c00] to-[#ff7700] hover:from-[#ffe270] hover:via-[#ffa020] hover:to-[#ff8c00] shadow-[0_0_25px_rgba(255,140,0,0.35)] hover:shadow-[0_0_35px_rgba(255,140,0,0.55)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer select-none w-full sm:w-auto"
                >
                  <span>Let's Talk</span>
                  <span class="font-bold transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
                </a>

                <DownloadResumeButton
                  fileUrl={portfolioStore.hero.resumeUrl}
                  fileName={portfolioStore.hero.resumeFileName}
                />
              </div>
            </div>
          </div>
        </section>

        <!-- ============================================== -->
        <!-- 2. ABOUT SECTION (FaultyTerminal + ScrollReveal) -->
        <!-- ============================================== -->
        <AboutSection scrollContainer={mainScrollWrapper} />

        <!-- ============================================== -->
        <!-- 3. SKILLS SECTION                              -->
        <!-- ============================================== -->
        <section id="skills" class="relative min-h-screen w-full text-white z-20 bg-[#1a130d] overflow-hidden py-24 md:py-32 flex flex-col justify-center items-center">
          <!-- Ambient Aurora Background Effect -->
          <div class="pointer-events-none absolute inset-0 w-full h-full z-0 overflow-hidden opacity-50">
            <Aurora
              colorStops={["#FF3E00", "#FF8A4C", "#FFB089"]}
              amplitude={1.0}
              blend={0.5}
              speed={1.0}
            />
          </div>

          <div class="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-8 text-left">
            <!-- Header with DecryptedText effect -->
            <div class="mb-6 md:mb-8 text-left">
              <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight">
                <DecryptedText 
                  text="Technical Skills"
                  speed={35}
                  maxIterations={8}
                  sequential={true}
                  animateOn="all"
                  class="text-transparent bg-clip-text bg-gradient-to-r from-[#ffdb58] to-[#ff8c00] font-extrabold tracking-tight font-sans"
                />
              </h2>
            </div>

            <!-- Categories with BorderGlow around container, individual icons as cursor targets -->
            <div class="flex flex-col gap-4 md:gap-5">
              {#each skillCategories as cat (cat.id)}
                <BorderGlow 
                  animated={true} 
                  glowColor="rgba(255, 140, 0, 0.14)" 
                  glowSize={220} 
                  borderRadius="12px"
                  class="p-3 md:p-3.5 border border-white/[0.04] hover:border-white/10 transition-colors backdrop-blur-[2px]"
                >
                  <div class="flex flex-col gap-2.5">
                    <!-- Short Decrypted category title -->
                    <div class="flex items-center gap-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#ff8c00]"></span>
                      <DecryptedText 
                        text={cat.title} 
                        speed={30}
                        maxIterations={6}
                        sequential={true}
                        animateOn="all"
                        class="text-xs md:text-sm font-bold tracking-[0.2em] text-gray-300 uppercase"
                      />
                    </div>

                    <!-- Fixed icon row: each individual icon is independently .cursor-target -->
                    <div class="flex flex-wrap items-center gap-5 md:gap-7 pl-3.5">
                      {#each cat.items as item (item.id)}
                        <div 
                          class="cursor-target inline-flex items-center justify-center p-1 rounded-md transition-transform duration-150 hover:scale-115"
                          title={item.name}
                        >
                          <img 
                            src={item.src} 
                            alt={item.alt}
                            class="h-9 w-9 md:h-10 md:w-10 rounded-md object-contain cursor-pointer filter hover:brightness-125 {item.invertDark ? 'brightness-0 invert opacity-90 hover:opacity-100' : ''}"
                            loading="lazy"
                          />
                        </div>
                      {/each}
                    </div>
                  </div>
                </BorderGlow>
              {/each}
            </div>
          </div>
        </section>

        <!-- ============================================== -->
        <!-- 4. PROJECTS SECTION (ElectricBorder + ScrambledText) -->
        <!-- ============================================== -->
        <ProjectsSection scrollContainer={mainScrollWrapper} />

        <!-- ============================================== -->
        <!-- 5. CONTACT SECTION                             -->
        <!-- ============================================== -->
        <section id="contact" class="relative w-full text-white z-20 bg-[#1a130d] overflow-hidden">
          <!-- 1. DotField Background -->
          <DotField
            dotRadius={1.5}
            dotSpacing={14}
            cursorRadius={500}
            cursorForce={0.1}
            bulgeOnly={true}
            bulgeStrength={67}
            glowRadius={160}
            sparkle={false}
            waveAmplitude={0}
            gradientFrom="#ff3e00"
            gradientTo="#ffb089"
            glowColor="#14110e"
            class="opacity-60 z-0"
          />

          <!-- Part 1: Contact Form -->
          <div class="relative z-10 min-h-screen w-full flex flex-col justify-center pt-24 md:pt-28 pb-16 px-6 md:px-8">
            <div class="max-w-4xl mx-auto w-full">
              <div class="max-w-xl text-left">
                <!-- CONTACT -->
                <span class="text-xs sm:text-sm font-mono font-bold tracking-[0.25em] text-[#ff8c00] uppercase mb-2 inline-block">
                  CONTACT
                </span>

                <!-- Get in Touch -->
                <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-8 sm:mb-10 font-sans">
                  <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ffdb58] to-[#ff8c00]">
                    Get in Touch
                  </span>
                </h2>

                {#if contactSuccess}
                  <div class="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-mono flex items-center gap-3 mb-6">
                    <span class="text-base font-bold">✓</span>
                    <span>Message sent successfully ✓</span>
                  </div>
                {/if}

                {#if contactError}
                  <div class="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm font-mono flex items-center gap-3 mb-6">
                    <span class="text-base font-bold">⚠</span>
                    <span>{contactError}</span>
                  </div>
                {/if}

                <!-- Contact Form -->
                <form
                  onsubmit={handleContactSubmit}
                  class="flex flex-col gap-5 sm:gap-6"
                >
                  <!-- Name -->
                  <div class="flex flex-col gap-2">
                    <label for="contact-name" class="text-xs sm:text-sm font-mono font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      bind:value={contactName}
                      disabled={isContactSending}
                      placeholder="Your Name"
                      required
                      class="w-full px-4 py-3 rounded-xl bg-[#14110e]/80 border border-white/10 hover:border-white/20 focus:border-[#ff8c00] focus:ring-1 focus:ring-[#ff8c00] text-gray-100 placeholder-gray-500 font-sans text-sm md:text-base outline-none transition-all shadow-inner backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <!-- Email -->
                  <div class="flex flex-col gap-2">
                    <label for="contact-email" class="text-xs sm:text-sm font-mono font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      bind:value={contactEmail}
                      disabled={isContactSending}
                      placeholder="your.email@example.com"
                      required
                      class="w-full px-4 py-3 rounded-xl bg-[#14110e]/80 border border-white/10 hover:border-white/20 focus:border-[#ff8c00] focus:ring-1 focus:ring-[#ff8c00] text-gray-100 placeholder-gray-500 font-sans text-sm md:text-base outline-none transition-all shadow-inner backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <!-- Message -->
                  <div class="flex flex-col gap-2">
                    <label for="contact-message" class="text-xs sm:text-sm font-mono font-medium text-gray-300 uppercase tracking-wider">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows="5"
                      bind:value={contactMessage}
                      disabled={isContactSending}
                      placeholder="Your message..."
                      required
                      class="w-full px-4 py-3.5 rounded-xl bg-[#14110e]/80 border border-white/10 hover:border-white/20 focus:border-[#ff8c00] focus:ring-1 focus:ring-[#ff8c00] text-gray-100 placeholder-gray-500 font-sans text-sm md:text-base outline-none transition-all shadow-inner backdrop-blur-sm resize-none min-h-[140px] sm:min-h-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
                    ></textarea>
                  </div>

                  <!-- Send → Button -->
                  <div class="pt-2">
                    <button
                      type="submit"
                      disabled={isContactSending}
                      class="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-black bg-gradient-to-r from-[#ffdb58] via-[#ff8c00] to-[#ff7700] hover:from-[#ffe270] hover:via-[#ffa020] hover:to-[#ff8c00] shadow-[0_0_25px_rgba(255,140,0,0.3)] hover:shadow-[0_0_35px_rgba(255,140,0,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer select-none disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                    >
                      {#if isContactSending}
                        <span class="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                        <span>Sending...</span>
                      {:else}
                        <span>Send</span>
                        <span class="font-bold transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
                      {/if}
                    </button>
                  </div>
                </form>

                <!-- Subtle Scroll Indicator Below Send Button -->
                <div class="pt-8 pb-4 flex items-center gap-2 text-xs font-mono text-[#ff8c00]/70 select-none">
                  <span class="inline-block animate-bounce">↓</span>
                  <span class="tracking-widest uppercase text-[11px]">Scroll down to explore social links</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Part 2: Background spiderman.mp4 with social media connection -->
          <div class="relative min-h-screen w-full flex flex-col justify-end items-center overflow-hidden px-6 pb-12 sm:pb-16 text-center select-none">
            <!-- Video Background -->
            <video
              src={spidermanVideo}
              autoplay
              loop
              muted
              playsinline
              class="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
            ></video>

            <!-- Bottom gradient for readability -->
            <div class="absolute inset-x-0 bottom-0 h-60 sm:h-72 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10 pointer-events-none"></div>

            <!-- Lower Side Content: Feel Free to connect on social media. + Icons -->
            <div class="relative z-20 flex flex-col items-center gap-4 sm:gap-6 pb-2">
              <h3 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight font-['Outfit',sans-serif] text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ffe066] via-45%-[#ff8c00] to-[#ff4500] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                Feel Free to connect on social media.
              </h3>

              <!-- Social Icons -->
              <div class="flex items-center justify-center gap-5 sm:gap-7 md:gap-8">
                {#each heroSocialLinks as link (link.id)}
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    aria-label={link.name}
                    title={link.name}
                    onclick={() => playNavClickSound(2)}
                    class="group inline-flex items-center justify-center transition-all duration-200 hover:scale-125 active:scale-95 cursor-pointer"
                  >
                    <img
                      src={link.icon}
                      alt={link.name}
                      class="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] transition-all duration-200 group-hover:brightness-125 group-hover:drop-shadow-[0_0_18px_rgba(255,140,0,0.7)]"
                      loading="lazy"
                    />
                  </a>
                {/each}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  </ClickSpark>
</main>
{/if}

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
  }

  .hero-animate-item {
    will-change: transform, opacity;
  }

  .skills-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .skills-scrollbar::-webkit-scrollbar-track {
    background: #1a130d;
  }
  .skills-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 140, 0, 0.25);
    border-radius: 9999px;
  }
  .skills-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 140, 0, 0.5);
  }
</style>

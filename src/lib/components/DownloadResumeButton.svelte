<script lang="ts">
  import { onDestroy } from "svelte";
  import { playNavClickSound } from "../utils/sound";

  interface Props {
    fileUrl?: string;
    fileName?: string;
    class?: string;
  }

  let {
    fileUrl = "/resume.pdf",
    fileName = "Sudarshna-Chand-MS-Resume.pdf",
    class: className = ""
  }: Props = $props();

  type ButtonState = "idle" | "downloading" | "completed";

  let status = $state<ButtonState>("idle");
  let progress = $state(0);
  let resetTimeout: number | null = null;
  let animFrameId: number | null = null;

  function triggerDownload() {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleClick(e: MouseEvent) {
    if (status !== "idle") {
      e.preventDefault();
      return;
    }

    playNavClickSound(2);
    status = "downloading";
    progress = 0;

    const duration = 1100; // Realistic smooth download animation duration (ms)
    const startTime = performance.now();

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const current = Math.min(100, Math.round((elapsed / duration) * 100));
      progress = current;

      if (current < 100) {
        animFrameId = requestAnimationFrame(updateProgress);
      } else {
        // Trigger browser download at completion
        triggerDownload();
        status = "completed";

        // Auto-reset state machine after 2.2 seconds
        if (resetTimeout) clearTimeout(resetTimeout);
        resetTimeout = window.setTimeout(() => {
          status = "idle";
          progress = 0;
        }, 2200);
      }
    };

    animFrameId = requestAnimationFrame(updateProgress);
  }

  onDestroy(() => {
    if (resetTimeout) clearTimeout(resetTimeout);
    if (animFrameId) cancelAnimationFrame(animFrameId);
  });
</script>

<a
  href={fileUrl}
  download={fileName}
  onclick={handleClick}
  data-slot="download-button"
  data-variant="default"
  data-state={status}
  aria-busy={status === "downloading"}
  aria-live="polite"
  class="resume-button group/button relative inline-flex shrink-0 items-center justify-center whitespace-nowrap outline-none select-none overflow-hidden rounded-xl font-semibold text-sm sm:text-base px-6 sm:px-7 py-3 sm:py-3.5 min-h-[46px] sm:min-h-[50px] transition-all duration-200 cursor-pointer w-full sm:w-auto
    {status === 'completed'
      ? 'border border-emerald-500/60 bg-[#161c16]/90 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
      : status === 'downloading'
      ? 'border border-[#ff8c00]/60 bg-[#1e150e]/90 text-white shadow-[0_0_25px_rgba(255,140,0,0.35)]'
      : 'border border-[#ff8c00]/45 bg-[#1a130d]/85 text-white hover:border-[#ff8c00] hover:bg-[#251a12] shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(255,140,0,0.35)] hover:scale-[1.03] active:scale-[0.98]'}
    backdrop-blur-md {className}"
>
  <!-- Real Progress Fill Layer -->
  <div
    class="absolute inset-y-0 left-0 transition-[width] duration-100 ease-out pointer-events-none z-0
      {status === 'completed'
        ? 'bg-gradient-to-r from-emerald-500/25 via-[#ffdb58]/20 to-emerald-400/30'
        : 'bg-gradient-to-r from-[#ff8c00]/30 via-[#ffdb58]/35 to-[#ff8c00]/40'}"
    style="width: {progress}%;"
  >
    {#if status === "downloading"}
      <!-- Leading edge glow line -->
      <div class="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#ffdb58] via-white to-[#ff8c00] shadow-[0_0_10px_#ffdb58]"></div>
    {/if}
  </div>

  <!-- Foreground Content with Status Icon Swap -->
  <span class="relative z-10 flex items-center justify-center gap-2.5">
    {#if status === "idle"}
      <!-- Idle Lucide Download Icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-download text-[#ff8c00] group-hover/button:text-[#ffdb58] transition-transform duration-200 group-hover/button:translate-y-0.5 shrink-0"
        aria-hidden="true"
      >
        <path d="M12 15V3"></path>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <path d="m7 10 5 5 5-5"></path>
      </svg>
      <span class="tracking-wide">Resume</span>
    {:else if status === "downloading"}
      <!-- Downloading Lucide Spinner Icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.3"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-loader-circle animate-spin text-[#ffdb58] shrink-0"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
      <span class="tracking-wide font-medium">Downloading...</span>
      <span class="font-mono text-xs text-[#ffdb58] tabular-nums font-semibold">
        {progress}%
      </span>
    {:else}
      <!-- Completed Lucide Check Icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-check text-emerald-400 shrink-0"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5"></path>
      </svg>
      <span class="tracking-wide text-emerald-300 font-semibold">Downloaded!</span>
    {/if}
  </span>
</a>

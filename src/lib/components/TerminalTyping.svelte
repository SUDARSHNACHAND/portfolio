<script lang="ts">
  import TextType from "./TextType.svelte";

  interface Props {
    lines?: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
    class?: string;
  }

  let {
    lines = [
      "Automating infrastructure and deployments.",
      "Building reliable CI/CD pipelines.",
      "Managing cloud and containerized systems.",
      "Monitoring applications and infrastructure."
    ],
    typingSpeed = 35,
    deletingSpeed = 20,
    pauseDuration = 1500,
    class: className = ""
  }: Props = $props();
</script>

<!-- Terminal-style dynamic statement using input-wrapper concept -->
<div
  class="input-wrapper group relative inline-flex items-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-black/45 border border-white/10 hover:border-[#ff8c00]/30 backdrop-blur-md shadow-2xl shadow-black/60 transition-all duration-300 max-w-full {className}"
  role="status"
  aria-live="polite"
>
  <!-- Command prompt indicator -->
  <span class="text-[#ff8c00] font-mono font-bold text-sm sm:text-base select-none shrink-0" aria-hidden="true">&gt;</span>

  <!-- Terminal statement display powered by Svelte Bits TextType -->
  <div class="font-mono text-xs sm:text-sm md:text-base text-gray-200 tracking-wide text-left flex items-center min-h-[1.5rem] whitespace-nowrap overflow-hidden">
    <TextType
      text={lines}
      {typingSpeed}
      {deletingSpeed}
      {pauseDuration}
      loop={true}
      showCursor={true}
      cursorCharacter="|"
      cursorClassName="text-[#ff8c00] font-bold text-xs sm:text-sm md:text-base"
      cursorBlinkDuration={0.5}
      class="text-gray-100 font-medium"
    />
  </div>
</div>


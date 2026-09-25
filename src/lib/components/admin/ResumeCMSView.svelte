<script lang="ts">
  import { onMount } from "svelte";

  interface ResumeData {
    id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    updated_at: string;
  }

  let resume = $state<ResumeData>({
    id: "primary",
    file_name: "M.S.SUDARSHNA CHAND CV.pdf",
    file_path: "/M.S.SUDARSHNA CHAND CV.pdf",
    file_size: 629626,
    updated_at: new Date().toISOString()
  });

  let isSaving = $state(false);
  let statusMessage = $state<{ text: string; isError?: boolean } | null>(null);

  onMount(() => {
    fetchResume();
  });

  async function fetchResume() {
    try {
      const res = await fetch("/api/admin/content/resume");
      if (res.ok) {
        const data = await res.json();
        if (data.resume) {
          resume = data.resume;
        }
      }
    } catch (e) {
      console.error("Failed to load resume:", e);
    }
  }

  async function saveResume() {
    if (isSaving) return;
    isSaving = true;
    statusMessage = null;

    try {
      const res = await fetch("/api/admin/content/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resume)
      });
      if (res.ok) {
        statusMessage = { text: "✓ Resume configuration updated successfully!" };
        setTimeout(() => (statusMessage = null), 4000);
      } else {
        throw new Error("Failed to save resume metadata.");
      }
    } catch (err: unknown) {
      statusMessage = {
        text: err instanceof Error ? err.message : "Error saving resume settings.",
        isError: true
      };
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="space-y-6 animate-fade-in font-sans">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1A100A] border border-neutral-800">
    <div>
      <div class="text-xs font-mono tracking-widest text-[#ff8c00] uppercase mb-1">CONTENT CMS</div>
      <h2 class="text-xl font-bold text-white uppercase tracking-wider font-mono">
        Resume Document Management
      </h2>
      <p class="text-xs text-neutral-400 mt-0.5">
        Configure the active curriculum vitae (CV) served to public visitors via the interactive download button.
      </p>
    </div>

    <button
      type="button"
      disabled={isSaving}
      onclick={saveResume}
      class="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff8c00] to-[#e65100] text-black font-extrabold text-xs font-mono tracking-wider shadow-lg shadow-orange-950/50 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
    >
      SAVE RESUME SETTINGS
    </button>
  </div>

  {#if statusMessage}
    <div class="p-3 rounded-xl border text-xs font-mono {statusMessage.isError ? 'bg-red-950/60 border-red-500/40 text-red-200' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'}">
      {statusMessage.text}
    </div>
  {/if}

  <!-- Active Resume Card -->
  <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 space-y-6">
    <div class="flex items-center gap-4 p-4 rounded-xl bg-[#0D0906] border border-[#ff8c00]/30">
      <div class="w-12 h-12 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 font-mono font-bold text-sm">
        PDF
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-bold text-white tracking-wide truncate">{resume.file_name}</div>
        <div class="text-xs font-mono text-neutral-400">
          Path: <span class="text-[#ff8c00]">{resume.file_path}</span> · Size: {(resume.file_size / 1024).toFixed(0)} KB
        </div>
      </div>
      <a
        href={resume.file_path}
        download={resume.file_name}
        class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs border border-white/10 shrink-0"
      >
        Download Test ↗
      </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
      <div class="flex flex-col gap-2">
        <label for="resume-display-name-input" class="text-neutral-400">Public Display File Name</label>
        <input
          id="resume-display-name-input"
          type="text"
          bind:value={resume.file_name}
          class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700 text-white focus:outline-none focus:border-[#ff8c00]"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="resume-file-path-input" class="text-neutral-400">Local Asset Path / URL</label>
        <input
          id="resume-file-path-input"
          type="text"
          bind:value={resume.file_path}
          class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700 text-white focus:outline-none focus:border-[#ff8c00]"
        />
      </div>
    </div>

    <div class="p-4 rounded-xl bg-[#0D0906] border border-neutral-800 text-xs text-neutral-400 leading-relaxed font-mono">
      <p class="font-bold text-[#ffdb58] mb-1">SECURITY & ASSET NOTE:</p>
      Resume documents are public portfolio assets hosted under standard static routes. They contain zero administrator credentials and are completely isolated from backend authentication logic.
    </div>
  </div>
</div>

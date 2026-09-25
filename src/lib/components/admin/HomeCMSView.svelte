<script lang="ts">
  import { onMount } from "svelte";

  let hero = $state({
    hero_label: "HI, I AM",
    name: "SUDARSHNA CHAND M S",
    role: "DevOps Engineer",
    typing_text: "Building resilient CI/CD pipelines & cloud infrastructure.",
    description: "Final-year Computer Science student passionate about building resilient, automated CI/CD pipelines, container orchestration, and cloud infrastructure.",
    profile_image: "",
    email: "sudarshanachand007@gmail.com",
    resume_url: "/M.S.SUDARSHNA CHAND CV.pdf",
    resume_file_name: "M.S.SUDARSHNA CHAND CV.pdf",
    status: "published"
  });

  let isSaving = $state(false);
  let statusMessage = $state<{ text: string; isError?: boolean } | null>(null);

  onMount(() => {
    fetchHomeData();
  });

  async function fetchHomeData() {
    try {
      const res = await fetch("/api/admin/content/home");
      if (res.ok) {
        const data = await res.json();
        if (data.home) {
          hero = { ...hero, ...data.home };
        }
      }
    } catch (e) {
      console.error("Failed to load home content:", e);
    }
  }

  async function handleSave(publish: boolean = false) {
    if (isSaving) return;
    isSaving = true;
    statusMessage = null;

    try {
      const res = await fetch("/api/admin/content/home", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...hero, publish })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");

      hero.status = publish ? "published" : "draft";
      statusMessage = {
        text: publish ? "✓ Home content published successfully to live website!" : "✓ Draft saved successfully."
      };
      setTimeout(() => (statusMessage = null), 4000);
    } catch (err: unknown) {
      statusMessage = {
        text: err instanceof Error ? err.message : "Error saving home content.",
        isError: true
      };
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="space-y-6 animate-fade-in font-sans">
  <!-- Section Header -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1A100A] border border-neutral-800">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <span class="text-xs font-mono tracking-widest text-[#ff8c00] uppercase">CONTENT CMS</span>
        <span class="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase {hero.status === 'published' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-amber-950 text-amber-400 border border-amber-500/40'}">
          {hero.status}
        </span>
      </div>
      <h2 class="text-xl font-bold text-white uppercase tracking-wider font-mono">
        Home Page Management
      </h2>
      <p class="text-xs text-neutral-400 mt-0.5">
        Manage hero greeting, name, professional title, description, and primary CTA buttons.
      </p>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <button
        type="button"
        disabled={isSaving}
        onclick={() => handleSave(false)}
        class="px-4 py-2 rounded-xl bg-[#0D0906] border border-neutral-700 hover:border-neutral-500 text-neutral-200 text-xs font-bold font-mono tracking-wider transition-all disabled:opacity-50"
      >
        SAVE DRAFT
      </button>
      <button
        type="button"
        disabled={isSaving}
        onclick={() => handleSave(true)}
        class="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff8c00] to-[#e65100] text-black font-extrabold text-xs font-mono tracking-wider shadow-lg shadow-orange-950/50 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
      >
        PUBLISH
      </button>
    </div>
  </div>

  {#if statusMessage}
    <div class="p-3 rounded-xl border text-xs font-mono {statusMessage.isError ? 'bg-red-950/60 border-red-500/40 text-red-200' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'}">
      {statusMessage.text}
    </div>
  {/if}

  <!-- Form Fields Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#1A100A] border border-neutral-800">
    <div class="flex flex-col gap-2">
      <label for="hero_label" class="text-xs font-mono text-neutral-400 uppercase tracking-wider">Hero Greeting Label</label>
      <input
        id="hero_label"
        type="text"
        bind:value={hero.hero_label}
        class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700/80 text-white text-sm focus:border-[#ff8c00] focus:outline-none"
      />
    </div>

    <div class="flex flex-col gap-2">
      <label for="name" class="text-xs font-mono text-neutral-400 uppercase tracking-wider">Full Name</label>
      <input
        id="name"
        type="text"
        bind:value={hero.name}
        class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700/80 text-white text-sm focus:border-[#ff8c00] focus:outline-none font-bold"
      />
    </div>

    <div class="flex flex-col gap-2">
      <label for="role" class="text-xs font-mono text-neutral-400 uppercase tracking-wider">Professional Title / Role</label>
      <input
        id="role"
        type="text"
        bind:value={hero.role}
        class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700/80 text-white text-sm focus:border-[#ff8c00] focus:outline-none text-[#ffdb58]"
      />
    </div>

    <div class="flex flex-col gap-2">
      <label for="typing_text" class="text-xs font-mono text-neutral-400 uppercase tracking-wider">Typing Text / Tagline</label>
      <input
        id="typing_text"
        type="text"
        bind:value={hero.typing_text}
        class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700/80 text-white text-sm focus:border-[#ff8c00] focus:outline-none"
      />
    </div>

    <div class="flex flex-col gap-2 md:col-span-2">
      <label for="description" class="text-xs font-mono text-neutral-400 uppercase tracking-wider">Hero Description / Subtitle</label>
      <textarea
        id="description"
        rows="3"
        bind:value={hero.description}
        class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700/80 text-white text-sm focus:border-[#ff8c00] focus:outline-none leading-relaxed"
      ></textarea>
    </div>

    <div class="flex flex-col gap-2">
      <label for="email" class="text-xs font-mono text-neutral-400 uppercase tracking-wider">Contact Email</label>
      <input
        id="email"
        type="email"
        bind:value={hero.email}
        class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700/80 text-white text-sm focus:border-[#ff8c00] focus:outline-none"
      />
    </div>

    <div class="flex flex-col gap-2">
      <label for="resume_file_name" class="text-xs font-mono text-neutral-400 uppercase tracking-wider">Active Resume File Name</label>
      <input
        id="resume_file_name"
        type="text"
        bind:value={hero.resume_file_name}
        class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700/80 text-white text-sm focus:border-[#ff8c00] focus:outline-none"
      />
    </div>
  </div>
</div>

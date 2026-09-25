<script lang="ts">
  import { onMount } from "svelte";

  let about = $state({
    section_label: "ABOUT ME",
    heading: "Building, Automating, and Improving Systems.",
    bio_p1: "I’m a final-year Computer Science and Engineering student with a strong interest in DevOps, cloud infrastructure, automation, and continuous delivery.",
    bio_p2: "I enjoy building reliable and scalable systems using technologies such as Linux, Git, Docker, Jenkins, Kubernetes, Terraform, and AWS. I’m particularly interested in automating development and deployment workflows and improving system reliability through monitoring and observability.",
    bio_p3: "I’m continuously learning new technologies, working on practical projects, and developing my skills to become a professional DevOps Engineer.",
    tech_badges: ["Linux", "Git", "Docker", "Jenkins", "Kubernetes", "Terraform", "AWS", "CI/CD Workflows", "Observability"],
    status: "published"
  });

  let newBadge = $state("");
  let isSaving = $state(false);
  let statusMessage = $state<{ text: string; isError?: boolean } | null>(null);

  onMount(() => {
    fetchAboutData();
  });

  async function fetchAboutData() {
    try {
      const res = await fetch("/api/admin/content/about");
      if (res.ok) {
        const data = await res.json();
        if (data.about) {
          about = { ...about, ...data.about };
        }
      }
    } catch (e) {
      console.error("Failed to load about data:", e);
    }
  }

  function addBadge() {
    const val = newBadge.trim();
    if (!val || about.tech_badges.includes(val)) return;
    about.tech_badges = [...about.tech_badges, val];
    newBadge = "";
  }

  function removeBadge(badge: string) {
    about.tech_badges = about.tech_badges.filter((b) => b !== badge);
  }

  async function handleSave(publish: boolean = false) {
    if (isSaving) return;
    isSaving = true;
    statusMessage = null;

    try {
      const res = await fetch("/api/admin/content/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...about, publish })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");

      about.status = publish ? "published" : "draft";
      statusMessage = {
        text: publish ? "✓ About section published successfully!" : "✓ Draft saved."
      };
      setTimeout(() => (statusMessage = null), 4000);
    } catch (err: unknown) {
      statusMessage = {
        text: err instanceof Error ? err.message : "Error saving about content.",
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
        <span class="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase {about.status === 'published' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-amber-950 text-amber-400 border border-amber-500/40'}">
          {about.status}
        </span>
      </div>
      <h2 class="text-xl font-bold text-white uppercase tracking-wider font-mono">
        About Page Management
      </h2>
      <p class="text-xs text-neutral-400 mt-0.5">
        Manage heading, biography paragraphs, core focus narrative, and highlighted tech badges.
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

  <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex flex-col gap-2">
        <label for="section_label" class="text-xs font-mono text-neutral-400 uppercase tracking-wider">Section Label</label>
        <input
          id="section_label"
          type="text"
          bind:value={about.section_label}
          class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700/80 text-white text-sm focus:border-[#ff8c00] focus:outline-none"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="heading" class="text-xs font-mono text-neutral-400 uppercase tracking-wider">Main Heading</label>
        <input
          id="heading"
          type="text"
          bind:value={about.heading}
          class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700/80 text-white text-sm focus:border-[#ff8c00] focus:outline-none font-semibold text-[#ffdb58]"
        />
      </div>
    </div>

    <!-- Biography Paragraphs -->
    <div class="flex flex-col gap-2">
      <label for="bio_p1" class="text-xs font-mono text-neutral-400 uppercase tracking-wider">Biography — Paragraph 1 (Introduction)</label>
      <textarea
        id="bio_p1"
        rows="2"
        bind:value={about.bio_p1}
        class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700/80 text-white text-sm focus:border-[#ff8c00] focus:outline-none leading-relaxed"
      ></textarea>
    </div>

    <div class="flex flex-col gap-2">
      <label for="bio_p2" class="text-xs font-mono text-neutral-400 uppercase tracking-wider">Biography — Paragraph 2 (Core Competency & Focus)</label>
      <textarea
        id="bio_p2"
        rows="3"
        bind:value={about.bio_p2}
        class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700/80 text-white text-sm focus:border-[#ff8c00] focus:outline-none leading-relaxed"
      ></textarea>
    </div>

    <div class="flex flex-col gap-2">
      <label for="bio_p3" class="text-xs font-mono text-neutral-400 uppercase tracking-wider">Biography — Paragraph 3 (Goals & Learning)</label>
      <textarea
        id="bio_p3"
        rows="2"
        bind:value={about.bio_p3}
        class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700/80 text-white text-sm focus:border-[#ff8c00] focus:outline-none leading-relaxed"
      ></textarea>
    </div>

    <!-- Tech Badges -->
    <div class="flex flex-col gap-3 pt-2 border-t border-neutral-800">
      <span class="text-xs font-mono text-neutral-400 uppercase tracking-wider">Highlighted Technology Badges</span>
      <div class="flex flex-wrap gap-2">
        {#each about.tech_badges as badge}
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D0906] border border-[#ff8c00]/30 text-white text-xs font-mono">
            {badge}
            <button
              type="button"
              onclick={() => removeBadge(badge)}
              class="text-neutral-500 hover:text-red-400 transition-colors"
            >
              ×
            </button>
          </span>
        {/each}
      </div>

      <div class="flex items-center gap-2 max-w-sm mt-2">
        <input
          type="text"
          bind:value={newBadge}
          placeholder="New tech badge..."
          onkeydown={(e) => e.key === "Enter" && (e.preventDefault(), addBadge())}
          class="flex-1 px-3 py-1.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-xs text-white focus:border-[#ff8c00] focus:outline-none font-mono"
        />
        <button
          type="button"
          onclick={addBadge}
          class="px-3 py-1.5 rounded-lg bg-[#ff8c00]/20 border border-[#ff8c00]/40 text-[#ffdb58] text-xs font-mono font-bold hover:bg-[#ff8c00]/30"
        >
          Add
        </button>
      </div>
    </div>
  </div>
</div>

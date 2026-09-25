<script lang="ts">
  import { onMount } from "svelte";

  interface SocialItem {
    id: string;
    name: string;
    url: string;
    icon: string;
    enabled: number;
    display_order: number;
  }

  let socials = $state<SocialItem[]>([]);
  let isSaving = $state(false);
  let statusMessage = $state<{ text: string; isError?: boolean } | null>(null);

  onMount(() => {
    fetchSocials();
  });

  async function fetchSocials() {
    try {
      const res = await fetch("/api/admin/content/socials");
      if (res.ok) {
        const data = await res.json();
        socials = data.socials || [];
      }
    } catch (e) {
      console.error("Failed to load socials:", e);
    }
  }

  async function saveSocials() {
    if (isSaving) return;
    isSaving = true;
    statusMessage = null;

    try {
      const res = await fetch("/api/admin/content/socials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socials })
      });
      if (res.ok) {
        statusMessage = { text: "✓ Social links updated successfully!" };
        setTimeout(() => (statusMessage = null), 3000);
      } else {
        throw new Error("Failed to save.");
      }
    } catch (err: unknown) {
      statusMessage = {
        text: err instanceof Error ? err.message : "Error saving social links.",
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
        Social Links Management
      </h2>
      <p class="text-xs text-neutral-400 mt-0.5">
        Configure social platforms, destination URLs, ordering, and visibility.
      </p>
    </div>

    <button
      type="button"
      disabled={isSaving}
      onclick={saveSocials}
      class="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff8c00] to-[#e65100] text-black font-extrabold text-xs font-mono tracking-wider shadow-lg shadow-orange-950/50 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
    >
      SAVE SOCIAL LINKS
    </button>
  </div>

  {#if statusMessage}
    <div class="p-3 rounded-xl border text-xs font-mono {statusMessage.isError ? 'bg-red-950/60 border-red-500/40 text-red-200' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'}">
      {statusMessage.text}
    </div>
  {/if}

  <div class="space-y-4">
    {#each socials as social (social.id)}
      <div class="p-5 rounded-2xl bg-[#1A100A] border border-neutral-800 hover:border-[#ff8c00]/30 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div class="flex items-center gap-3 w-40 shrink-0">
          <input
            type="checkbox"
            checked={social.enabled === 1}
            onchange={(e) => (social.enabled = (e.currentTarget as HTMLInputElement).checked ? 1 : 0)}
            class="w-4 h-4 accent-[#ff8c00] rounded"
          />
          <span class="text-sm font-bold text-white tracking-wide">{social.name}</span>
        </div>

        <div class="flex-1 w-full">
          <input
            type="text"
            bind:value={social.url}
            placeholder="https://..."
            class="w-full px-4 py-2 rounded-xl bg-[#0D0906] border border-neutral-700/80 text-xs font-mono text-white focus:outline-none focus:border-[#ff8c00]"
          />
        </div>

        <div class="flex items-center gap-2 shrink-0 font-mono text-xs">
          <span class="text-neutral-500">Order:</span>
          <input
            type="number"
            bind:value={social.display_order}
            class="w-16 px-2 py-1.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-center text-white"
          />
        </div>
      </div>
    {/each}
  </div>
</div>

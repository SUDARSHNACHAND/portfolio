<script lang="ts">
  import { onMount } from "svelte";

  interface HealthSection {
    name: string;
    percentage: number;
    status: string;
  }

  interface HealthIssue {
    section: string;
    message: string;
    severity: "warning" | "error";
  }

  let sections = $state<HealthSection[]>([
    { name: "HOME", percentage: 100, status: "complete" },
    { name: "ABOUT", percentage: 95, status: "complete" },
    { name: "EDUCATION", percentage: 100, status: "complete" },
    { name: "EXPERIENCE", percentage: 90, status: "complete" },
    { name: "SKILLS", percentage: 100, status: "complete" },
    { name: "PROJECTS", percentage: 92, status: "complete" },
    { name: "CONTACT", percentage: 100, status: "complete" }
  ]);

  let issues = $state<HealthIssue[]>([]);
  let isLoading = $state(true);

  onMount(() => {
    fetchHealth();
  });

  async function fetchHealth() {
    try {
      isLoading = true;
      const res = await fetch("/api/admin/content-health");
      if (res.ok) {
        const data = await res.json();
        sections = data.sections || sections;
        issues = data.issues || [];
      }
    } catch (e) {
      console.error("Failed to load content health:", e);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="space-y-6 animate-fade-in font-sans">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1A100A] border border-neutral-800">
    <div>
      <div class="text-xs font-mono tracking-widest text-[#ff8c00] uppercase mb-1">INSIGHTS</div>
      <h2 class="text-xl font-bold text-white uppercase tracking-wider font-mono">
        Content Health & Diagnostics
      </h2>
      <p class="text-xs text-neutral-400 mt-0.5">
        Audit sections for missing links, incomplete draft records, and publication readiness.
      </p>
    </div>

    <button
      type="button"
      onclick={fetchHealth}
      class="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#ff8c00]/40 text-white font-mono text-xs"
    >
      Run Audit Scan ↺
    </button>
  </div>

  <!-- Completion Progress Bars -->
  <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 space-y-5">
    <h3 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
      Section Readiness Scores
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
      {#each sections as sec}
        <div class="p-4 rounded-xl bg-[#0D0906] border border-neutral-800 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-white font-bold">{sec.name}</span>
            <span class="{sec.percentage === 100 ? 'text-emerald-400' : 'text-[#ffdb58]'} font-bold">
              {sec.percentage}%
            </span>
          </div>

          <div class="w-full h-2 rounded-full bg-neutral-900 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500 {sec.percentage === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#ff8c00] to-[#ffdb58]'}"
              style="width: {sec.percentage}%"
            ></div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Diagnostics Checklist & Warnings -->
  <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 space-y-4">
    <h3 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
      Diagnostic Observations & Recommendations
    </h3>

    {#if issues.length === 0}
      <div class="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2">
        <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        All sections are fully configured with complete links, assets, and descriptions.
      </div>
    {:else}
      <div class="space-y-3 font-mono text-xs">
        {#each issues as issue}
          <div class="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 flex items-start gap-3">
            <span class="text-amber-400 font-bold shrink-0">⚠ [{issue.section}]</span>
            <span>{issue.message}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

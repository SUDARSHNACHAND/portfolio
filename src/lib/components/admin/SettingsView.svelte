<script lang="ts">
  let siteTitle = $state("Sudarshan Chand — DevOps Engineer");
  let metaDescription = $state("Final-year Computer Science student passionate about building resilient, automated CI/CD pipelines, container orchestration, and cloud infrastructure.");
  let isSaving = $state(false);
  let statusMessage = $state<string | null>(null);

  function handleSave(e?: Event) {
    if (e) e.preventDefault();
    isSaving = true;
    setTimeout(() => {
      isSaving = false;
      statusMessage = "✓ System settings updated successfully!";
      setTimeout(() => (statusMessage = null), 3000);
    }, 400);
  }
</script>

<div class="space-y-6 animate-fade-in font-sans">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1A100A] border border-neutral-800">
    <div>
      <div class="text-xs font-mono tracking-widest text-[#ff8c00] uppercase mb-1">SYSTEM</div>
      <h2 class="text-xl font-bold text-white uppercase tracking-wider font-mono">
        Portfolio System & SEO Settings
      </h2>
      <p class="text-xs text-neutral-400 mt-0.5">
        Configure meta tags, search engine indexing parameters, and database caching.
      </p>
    </div>

    <button
      type="button"
      onclick={handleSave}
      class="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff8c00] to-[#e65100] text-black font-extrabold text-xs font-mono tracking-wider shadow-lg shadow-orange-950/50 hover:brightness-110 active:scale-95 transition-all"
    >
      SAVE SETTINGS
    </button>
  </div>

  {#if statusMessage}
    <div class="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 text-emerald-200 text-xs font-mono">
      {statusMessage}
    </div>
  {/if}

  <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
      <div class="flex flex-col gap-1.5 md:col-span-2">
        <label for="page-title-input" class="text-neutral-400">Browser Page Title</label>
        <input
          id="page-title-input"
          type="text"
          bind:value={siteTitle}
          class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white focus:border-[#ff8c00] focus:outline-none"
        />
      </div>

      <div class="flex flex-col gap-1.5 md:col-span-2">
        <label for="meta-desc-input" class="text-neutral-400">Meta Description (SEO)</label>
        <textarea
          id="meta-desc-input"
          rows="3"
          bind:value={metaDescription}
          class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white focus:border-[#ff8c00] focus:outline-none"
        ></textarea>
      </div>
    </div>

    <div class="pt-6 border-t border-neutral-800 space-y-3 font-mono text-xs">
      <h3 class="font-bold text-white uppercase tracking-wider">Database & Platform Info</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-neutral-400">
        <div class="p-3 rounded-xl bg-[#0D0906] border border-neutral-800">
          <div class="text-[10px] text-neutral-500">DATABASE ENGINE</div>
          <div class="text-white font-bold mt-1">Private Embedded SQLite (WAL) / PostgreSQL</div>
        </div>
        <div class="p-3 rounded-xl bg-[#0D0906] border border-neutral-800">
          <div class="text-[10px] text-neutral-500">PASSWORD HASHING</div>
          <div class="text-white font-bold mt-1">RFC 9106 Argon2id (64MB)</div>
        </div>
        <div class="p-3 rounded-xl bg-[#0D0906] border border-neutral-800">
          <div class="text-[10px] text-neutral-500">SESSION AUTH</div>
          <div class="text-white font-bold mt-1">HTTP-Only SameSite Cookie</div>
        </div>
      </div>
    </div>
  </div>
</div>

<script lang="ts">
  import { onMount } from "svelte";
  import DeleteConfirmModal from "./DeleteConfirmModal.svelte";
  import { portfolioStore } from "../../data/portfolioStore.svelte";

  interface ExperienceItem {
    id: string;
    type: "internship" | "achievement" | "experience";
    title: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string;
    description: string;
    certificate_url: string;
    external_url: string;
    year: string;
    display_order: number;
    status: string;
  }

  let items = $state<ExperienceItem[]>([]);
  let isEditing = $state(false);
  let editingItem = $state<ExperienceItem>({
    id: "",
    type: "internship",
    title: "",
    company: "",
    location: "Karaikudi",
    start_date: "01 MAR 2024",
    end_date: "08 MAR 2024",
    description: "",
    certificate_url: "",
    external_url: "",
    year: "2024",
    display_order: 1,
    status: "published"
  });

  let deleteId = $state<string | null>(null);
  let isDeleteModalOpen = $state(false);

  onMount(() => {
    fetchExperience();
  });

  async function fetchExperience() {
    try {
      const res = await fetch("/api/admin/content/experience");
      if (res.ok) {
        const data = await res.json();
        items = data.experience || [];
      }
    } catch (e) {
      console.error("Failed to load experience:", e);
    }
  }

  function openCreateModal() {
    editingItem = {
      id: "",
      type: "internship",
      title: "",
      company: "",
      location: "",
      start_date: "",
      end_date: "",
      description: "",
      certificate_url: "",
      external_url: "",
      year: new Date().getFullYear().toString(),
      display_order: items.length + 1,
      status: "draft"
    };
    isEditing = true;
  }

  function openEditModal(item: ExperienceItem) {
    editingItem = { ...item };
    isEditing = true;
  }

  async function saveItem() {
    try {
      const res = await fetch("/api/admin/content/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem)
      });
      if (res.ok) {
        isEditing = false;
        await fetchExperience();
        portfolioStore.syncWithPublishedContent();
      }
    } catch (e) {
      console.error("Failed to save experience:", e);
    }
  }

  function confirmDelete(id: string) {
    deleteId = id;
    isDeleteModalOpen = true;
  }

  async function executeDelete() {
    if (!deleteId) return;
    try {
      await fetch(`/api/admin/content/experience/${deleteId}`, { method: "DELETE" });
      isDeleteModalOpen = false;
      deleteId = null;
      await fetchExperience();
      portfolioStore.syncWithPublishedContent();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  }

  async function toggleStatus(item: ExperienceItem) {
    const newStatus = item.status === "published" ? "draft" : "published";
    await fetch("/api/admin/content/experience", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, status: newStatus })
    });
    await fetchExperience();
    portfolioStore.syncWithPublishedContent();
  }
</script>

<div class="space-y-6 animate-fade-in font-sans">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1A100A] border border-neutral-800">
    <div>
      <div class="text-xs font-mono tracking-widest text-[#ff8c00] uppercase mb-1">CONTENT CMS</div>
      <h2 class="text-xl font-bold text-white uppercase tracking-wider font-mono">
        Experience & Recognition Management
      </h2>
      <p class="text-xs text-neutral-400 mt-0.5">
        Manage internships, technical certifications, training programs, and symposium achievements.
      </p>
    </div>

    <button
      type="button"
      onclick={openCreateModal}
      class="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff8c00] to-[#e65100] text-black font-extrabold text-xs font-mono tracking-wider shadow-lg shadow-orange-950/50 hover:brightness-110 active:scale-95 transition-all"
    >
      + ADD EXPERIENCE
    </button>
  </div>

  <!-- Items List -->
  <div class="space-y-4">
    {#each items as item (item.id)}
      <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 hover:border-[#ff8c00]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1.5 flex-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono uppercase px-2 py-0.5 rounded-full {item.type === 'achievement' ? 'bg-amber-950 text-[#ffdb58] border border-amber-500/40' : 'bg-[#0D0906] text-[#ff8c00] border border-neutral-700'}">
              {item.type}
            </span>
            <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-[#0D0906] text-neutral-300 border border-neutral-700">
              {item.year}
            </span>
            <span class="text-xs font-mono px-2 py-0.5 rounded-full {item.status === 'published' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'}">
              {item.status.toUpperCase()}
            </span>
            <span class="text-xs text-neutral-500 font-mono">#{item.display_order}</span>
          </div>

          <h3 class="text-lg font-bold text-white tracking-wide">{item.title}</h3>
          <p class="text-xs font-mono text-[#ff8c00]">{item.company} · {item.location} ({item.start_date} — {item.end_date})</p>
          <p class="text-xs text-neutral-400 max-w-2xl mt-1 leading-relaxed">{item.description}</p>

          {#if item.certificate_url}
            <div class="flex items-center gap-1.5 text-[11px] font-mono text-[#ffdb58] mt-2">
              <span>📜 Certificate:</span>
              <a href={item.certificate_url} target="_blank" rel="noopener noreferrer" class="hover:underline text-neutral-300">
                {item.certificate_url}
              </a>
            </div>
          {/if}
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 self-end md:self-center">
          <button
            type="button"
            onclick={() => toggleStatus(item)}
            class="px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors {item.status === 'published' ? 'border-amber-500/40 text-amber-300 hover:bg-amber-950/40' : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40'}"
          >
            {item.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <button
            type="button"
            onclick={() => openEditModal(item)}
            class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#ff8c00]/50 text-white text-xs font-mono font-medium transition-all"
          >
            Edit
          </button>
          <button
            type="button"
            onclick={() => confirmDelete(item.id)}
            class="px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-500/30 text-red-300 hover:bg-red-950/60 text-xs font-mono font-medium transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    {/each}
  </div>

  <!-- Create/Edit Modal -->
  {#if isEditing}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div class="relative w-full max-w-xl p-6 md:p-8 rounded-2xl bg-[#1A100A] border border-[#ff8c00]/30 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <h3 class="text-lg font-bold text-white font-mono uppercase tracking-wider">
          {editingItem.id ? "Edit Experience Item" : "Add Experience Item"}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div class="flex flex-col gap-1.5">
            <label for="exp-type-select" class="text-neutral-400">Type</label>
            <select id="exp-type-select" bind:value={editingItem.type} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white">
              <option value="internship">Internship</option>
              <option value="achievement">Achievement / Award</option>
              <option value="experience">Professional Experience</option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="exp-year-input" class="text-neutral-400">Year</label>
            <input id="exp-year-input" type="text" bind:value={editingItem.year} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5 md:col-span-2">
            <label for="exp-title-input" class="text-neutral-400">Title</label>
            <input id="exp-title-input" type="text" bind:value={editingItem.title} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="exp-company-input" class="text-neutral-400">Company / Organization</label>
            <input id="exp-company-input" type="text" bind:value={editingItem.company} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="exp-location-input" class="text-neutral-400">Location</label>
            <input id="exp-location-input" type="text" bind:value={editingItem.location} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="exp-start-date-input" class="text-neutral-400">Start Date</label>
            <input id="exp-start-date-input" type="text" bind:value={editingItem.start_date} placeholder="e.g. 01 MAR 2024" class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="exp-end-date-input" class="text-neutral-400">End Date</label>
            <input id="exp-end-date-input" type="text" bind:value={editingItem.end_date} placeholder="e.g. 08 MAR 2024" class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5 md:col-span-2">
            <label for="exp-cert-url-input" class="text-neutral-400">Certificate File URL / Path</label>
            <input id="exp-cert-url-input" type="text" bind:value={editingItem.certificate_url} placeholder="/certification/2024.jpeg" class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="exp-ext-url-input" class="text-neutral-400">External URL (Optional)</label>
            <input id="exp-ext-url-input" type="text" bind:value={editingItem.external_url} placeholder="https://..." class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="exp-order-input" class="text-neutral-400">Display Order</label>
            <input id="exp-order-input" type="number" bind:value={editingItem.display_order} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5 md:col-span-2">
            <label for="exp-desc-input" class="text-neutral-400">Description</label>
            <textarea id="exp-desc-input" rows="3" bind:value={editingItem.description} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white"></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
          <button
            type="button"
            onclick={() => (isEditing = false)}
            class="px-4 py-2 text-xs font-mono text-neutral-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onclick={saveItem}
            class="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff8c00] to-[#e65100] text-black font-bold text-xs font-mono shadow-lg"
          >
            Save Record
          </button>
        </div>
      </div>
    </div>
  {/if}

  <DeleteConfirmModal
    isOpen={isDeleteModalOpen}
    title="DELETE EXPERIENCE ITEM?"
    message="This experience/achievement record will be permanently deleted from your portfolio."
    onConfirm={executeDelete}
    onCancel={() => (isDeleteModalOpen = false)}
  />
</div>

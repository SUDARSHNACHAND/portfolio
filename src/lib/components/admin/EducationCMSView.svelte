<script lang="ts">
  import { onMount } from "svelte";
  import DeleteConfirmModal from "./DeleteConfirmModal.svelte";

  interface EducationItem {
    id: string;
    degree: string;
    institution: string;
    location: string;
    start_year: string;
    end_year: string;
    status_label: string;
    branch: string;
    cgpa: string;
    description: string;
    display_order: number;
    status: string;
  }

  let items = $state<EducationItem[]>([]);
  let isLoading = $state(true);
  let isEditing = $state(false);
  let editingItem = $state<EducationItem>({
    id: "",
    degree: "",
    institution: "",
    location: "Karaikudi",
    start_year: "2023",
    end_year: "2027",
    status_label: "Pursuing",
    branch: "Computer Science and Engineering",
    cgpa: "",
    description: "",
    display_order: 1,
    status: "published"
  });

  let deleteId = $state<string | null>(null);
  let isDeleteModalOpen = $state(false);

  onMount(() => {
    fetchEducation();
  });

  async function fetchEducation() {
    try {
      isLoading = true;
      const res = await fetch("/api/admin/content/education");
      if (res.ok) {
        const data = await res.json();
        items = data.education || [];
      }
    } catch (e) {
      console.error("Failed to load education:", e);
    } finally {
      isLoading = false;
    }
  }

  function openCreateModal() {
    editingItem = {
      id: "",
      degree: "",
      institution: "",
      location: "",
      start_year: new Date().getFullYear().toString(),
      end_year: (new Date().getFullYear() + 4).toString(),
      status_label: "Pursuing",
      branch: "",
      cgpa: "",
      description: "",
      display_order: items.length + 1,
      status: "published"
    };
    isEditing = true;
  }

  function openEditModal(item: EducationItem) {
    editingItem = { ...item };
    isEditing = true;
  }

  async function saveItem() {
    try {
      const res = await fetch("/api/admin/content/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem)
      });
      if (res.ok) {
        isEditing = false;
        fetchEducation();
      }
    } catch (e) {
      console.error("Failed to save education item:", e);
    }
  }

  function confirmDelete(id: string) {
    deleteId = id;
    isDeleteModalOpen = true;
  }

  async function executeDelete() {
    if (!deleteId) return;
    try {
      await fetch(`/api/admin/content/education/${deleteId}`, { method: "DELETE" });
      isDeleteModalOpen = false;
      deleteId = null;
      fetchEducation();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  }

  async function toggleStatus(item: EducationItem) {
    const newStatus = item.status === "published" ? "draft" : "published";
    await fetch("/api/admin/content/education", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, status: newStatus })
    });
    fetchEducation();
  }
</script>

<div class="space-y-6 animate-fade-in font-sans">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1A100A] border border-neutral-800">
    <div>
      <div class="text-xs font-mono tracking-widest text-[#ff8c00] uppercase mb-1">CONTENT CMS</div>
      <h2 class="text-xl font-bold text-white uppercase tracking-wider font-mono">
        Education Section Management
      </h2>
      <p class="text-xs text-neutral-400 mt-0.5">
        Manage academic credentials, institutions, branches, CGPA, and timeline.
      </p>
    </div>

    <button
      type="button"
      onclick={openCreateModal}
      class="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff8c00] to-[#e65100] text-black font-extrabold text-xs font-mono tracking-wider shadow-lg shadow-orange-950/50 hover:brightness-110 active:scale-95 transition-all"
    >
      + ADD EDUCATION
    </button>
  </div>

  <!-- Education Cards List -->
  <div class="space-y-4">
    {#each items as item (item.id)}
      <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 hover:border-[#ff8c00]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1.5 flex-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-[#0D0906] border border-neutral-700 text-[#ffdb58]">
              {item.start_year} — {item.end_year}
            </span>
            <span class="text-xs font-mono px-2 py-0.5 rounded-full {item.status === 'published' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'}">
              {item.status.toUpperCase()}
            </span>
            <span class="text-xs text-neutral-400 font-mono">Order: #{item.display_order}</span>
          </div>

          <h3 class="text-lg font-bold text-white tracking-wide">{item.degree}</h3>
          <p class="text-xs font-mono text-[#ff8c00]">{item.institution} · {item.location}</p>
          <p class="text-xs text-neutral-400">Branch: <span class="text-neutral-200">{item.branch}</span> | CGPA/Score: <span class="text-neutral-200">{item.cgpa}</span></p>
          {#if item.description}
            <p class="text-xs text-neutral-400 mt-2 max-w-2xl leading-relaxed">{item.description}</p>
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
          {editingItem.id ? "Edit Education Record" : "Add Education Record"}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div class="flex flex-col gap-1.5 md:col-span-2">
            <label for="edu-degree-input" class="text-neutral-400">Degree / Qualification</label>
            <input id="edu-degree-input" type="text" bind:value={editingItem.degree} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5 md:col-span-2">
            <label for="edu-institution-input" class="text-neutral-400">Institution / College Name</label>
            <input id="edu-institution-input" type="text" bind:value={editingItem.institution} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="edu-location-input" class="text-neutral-400">Location</label>
            <input id="edu-location-input" type="text" bind:value={editingItem.location} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="edu-branch-input" class="text-neutral-400">Branch / Specialization</label>
            <input id="edu-branch-input" type="text" bind:value={editingItem.branch} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="edu-start-year-input" class="text-neutral-400">Start Year</label>
            <input id="edu-start-year-input" type="text" bind:value={editingItem.start_year} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="edu-end-year-input" class="text-neutral-400">End Year</label>
            <input id="edu-end-year-input" type="text" bind:value={editingItem.end_year} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="edu-cgpa-input" class="text-neutral-400">CGPA / Percentage</label>
            <input id="edu-cgpa-input" type="text" bind:value={editingItem.cgpa} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="edu-order-input" class="text-neutral-400">Display Order</label>
            <input id="edu-order-input" type="number" bind:value={editingItem.display_order} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5 md:col-span-2">
            <label for="edu-desc-input" class="text-neutral-400">Description / Highlights</label>
            <textarea id="edu-desc-input" rows="3" bind:value={editingItem.description} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white"></textarea>
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
    title="DELETE EDUCATION RECORD?"
    message="This academic credential will be permanently removed from your portfolio."
    onConfirm={executeDelete}
    onCancel={() => (isDeleteModalOpen = false)}
  />
</div>

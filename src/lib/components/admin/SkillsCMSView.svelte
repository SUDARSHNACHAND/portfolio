<script lang="ts">
  import { onMount } from "svelte";
  import DeleteConfirmModal from "./DeleteConfirmModal.svelte";

  const CATEGORIES = [
    "ALL",
    "DEVOPS",
    "AWS",
    "GIT",
    "MONITORING",
    "ENVIRONMENT",
    "DEVELOPER TOOLS",
    "BACKEND",
    "DATABASE",
    "FRONTEND"
  ];

  interface SkillItem {
    id: string;
    category: string;
    name: string;
    icon_path: string;
    icon_type: string;
    proficiency: number;
    description: string;
    display_order: number;
    status: string;
  }

  let skills = $state<SkillItem[]>([]);
  let activeCategory = $state("ALL");
  let isEditing = $state(false);
  let editingItem = $state<SkillItem>({
    id: "",
    category: "DEVOPS",
    name: "",
    icon_path: "",
    icon_type: "svg",
    proficiency: 90,
    description: "",
    display_order: 1,
    status: "published"
  });

  let deleteId = $state<string | null>(null);
  let isDeleteModalOpen = $state(false);

  const filteredSkills = $derived(
    activeCategory === "ALL"
      ? skills
      : skills.filter((s) => s.category.toUpperCase() === activeCategory)
  );

  onMount(() => {
    fetchSkills();
  });

  async function fetchSkills() {
    try {
      const res = await fetch("/api/admin/content/skills");
      if (res.ok) {
        const data = await res.json();
        skills = data.skills || [];
      }
    } catch (e) {
      console.error("Failed to load skills:", e);
    }
  }

  function openCreateModal() {
    editingItem = {
      id: "",
      category: activeCategory === "ALL" ? "DEVOPS" : activeCategory,
      name: "",
      icon_path: "",
      icon_type: "svg",
      proficiency: 85,
      description: "",
      display_order: skills.length + 1,
      status: "published"
    };
    isEditing = true;
  }

  function openEditModal(skill: SkillItem) {
    editingItem = { ...skill };
    isEditing = true;
  }

  async function saveSkill() {
    try {
      const res = await fetch("/api/admin/content/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem)
      });
      if (res.ok) {
        isEditing = false;
        fetchSkills();
      }
    } catch (e) {
      console.error("Failed to save skill:", e);
    }
  }

  function confirmDelete(id: string) {
    deleteId = id;
    isDeleteModalOpen = true;
  }

  async function executeDelete() {
    if (!deleteId) return;
    try {
      await fetch(`/api/admin/content/skills/${deleteId}`, { method: "DELETE" });
      isDeleteModalOpen = false;
      deleteId = null;
      fetchSkills();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  }
</script>

<div class="space-y-6 animate-fade-in font-sans">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1A100A] border border-neutral-800">
    <div>
      <div class="text-xs font-mono tracking-widest text-[#ff8c00] uppercase mb-1">CONTENT CMS</div>
      <h2 class="text-xl font-bold text-white uppercase tracking-wider font-mono">
        Technical Skills Management
      </h2>
      <p class="text-xs text-neutral-400 mt-0.5">
        Manage categorized tools, SVG/WebP local assets, and proficiency ratings.
      </p>
    </div>

    <button
      type="button"
      onclick={openCreateModal}
      class="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff8c00] to-[#e65100] text-black font-extrabold text-xs font-mono tracking-wider shadow-lg shadow-orange-950/50 hover:brightness-110 active:scale-95 transition-all"
    >
      + ADD SKILL
    </button>
  </div>

  <!-- Category Filter Tabs -->
  <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
    {#each CATEGORIES as cat}
      <button
        type="button"
        onclick={() => (activeCategory = cat)}
        class="px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all {activeCategory === cat ? 'bg-[#ff8c00] text-black font-extrabold shadow-md shadow-orange-950/40' : 'bg-[#1A100A] border border-neutral-800 text-neutral-400 hover:text-white'}"
      >
        {cat}
      </button>
    {/each}
  </div>

  <!-- Skills Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {#each filteredSkills as skill (skill.id)}
      <div class="p-4 rounded-xl bg-[#1A100A] border border-neutral-800 hover:border-[#ff8c00]/40 transition-all flex flex-col justify-between group">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0D0906] text-[#ffdb58] border border-neutral-800">
              {skill.category}
            </span>
            <span class="text-[10px] font-mono text-neutral-500">#{skill.display_order}</span>
          </div>

          <div class="flex items-center gap-3 mb-2">
            {#if skill.icon_path}
              <div class="w-8 h-8 rounded-lg bg-[#0D0906] p-1 flex items-center justify-center border border-neutral-800 shrink-0">
                <img src={skill.icon_path} alt={skill.name} class="w-full h-full object-contain" />
              </div>
            {/if}
            <div class="font-bold text-white text-sm tracking-wide">{skill.name}</div>
          </div>

          <div class="space-y-1 mt-3">
            <div class="flex justify-between text-[11px] font-mono text-neutral-400">
              <span>Proficiency</span>
              <span class="text-[#ff8c00]">{skill.proficiency}%</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-[#ff8c00] to-[#ffdb58] rounded-full" style="width: {skill.proficiency}%"></div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-neutral-800/80 font-mono text-xs">
          <button
            type="button"
            onclick={() => openEditModal(skill)}
            class="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-neutral-300"
          >
            Edit
          </button>
          <button
            type="button"
            onclick={() => confirmDelete(skill.id)}
            class="px-2.5 py-1 rounded bg-red-950/30 hover:bg-red-950/60 text-red-400"
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
      <div class="relative w-full max-w-md p-6 rounded-2xl bg-[#1A100A] border border-[#ff8c00]/30 shadow-2xl space-y-4">
        <h3 class="text-lg font-bold text-white font-mono uppercase tracking-wider">
          {editingItem.id ? "Edit Skill" : "Add Skill"}
        </h3>

        <div class="space-y-3 text-xs font-mono">
          <div class="flex flex-col gap-1.5">
            <label for="skill-category-select" class="text-neutral-400">Category</label>
            <select id="skill-category-select" bind:value={editingItem.category} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white">
              {#each CATEGORIES.filter(c => c !== "ALL") as cat}
                <option value={cat}>{cat}</option>
              {/each}
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="skill-name-input" class="text-neutral-400">Skill / Tool Name</label>
            <input id="skill-name-input" type="text" bind:value={editingItem.name} placeholder="e.g. Docker" class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="skill-icon-input" class="text-neutral-400">Icon Asset Path or SVG URL</label>
            <input id="skill-icon-input" type="text" bind:value={editingItem.icon_path} placeholder="/src/lib/assets/logos/... or data:image/svg+xml..." class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between">
              <label for="skill-proficiency-input" class="text-neutral-400">Proficiency: {editingItem.proficiency}%</label>
            </div>
            <input id="skill-proficiency-input" type="range" min="10" max="100" bind:value={editingItem.proficiency} class="accent-[#ff8c00]" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="skill-order-input" class="text-neutral-400">Display Order</label>
            <input id="skill-order-input" type="number" bind:value={editingItem.display_order} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
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
            onclick={saveSkill}
            class="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff8c00] to-[#e65100] text-black font-bold text-xs font-mono shadow-lg"
          >
            Save Skill
          </button>
        </div>
      </div>
    </div>
  {/if}

  <DeleteConfirmModal
    isOpen={isDeleteModalOpen}
    title="DELETE TECHNICAL SKILL?"
    message="This skill item will be removed from your portfolio."
    onConfirm={executeDelete}
    onCancel={() => (isDeleteModalOpen = false)}
  />
</div>

<script lang="ts">
  import { onMount } from "svelte";
  import DeleteConfirmModal from "./DeleteConfirmModal.svelte";

  interface ProjectTool {
    name: string;
    icon?: string;
  }

  interface ProjectItem {
    id: string;
    project_number: string;
    tag: string;
    title: string;
    description: string;
    bullets: string[];
    tools: ProjectTool[];
    github_url: string;
    live_url: string;
    image_url?: string;
    featured: number;
    display_order: number;
    status: string;
  }

  let projects = $state<ProjectItem[]>([]);
  let isEditing = $state(false);
  let editingProject = $state<ProjectItem>({
    id: "",
    project_number: "01",
    tag: "CI/CD & CLOUD-NATIVE DEPLOYMENT",
    title: "",
    description: "",
    bullets: [""],
    tools: [],
    github_url: "https://github.com/SUDARSHNACHAND",
    live_url: "",
    featured: 1,
    display_order: 1,
    status: "published"
  });

  let newToolName = $state("");
  let deleteId = $state<string | null>(null);
  let isDeleteModalOpen = $state(false);

  onMount(() => {
    fetchProjects();
  });

  async function fetchProjects() {
    try {
      const res = await fetch("/api/admin/content/projects");
      if (res.ok) {
        const data = await res.json();
        projects = data.projects || [];
      }
    } catch (e) {
      console.error("Failed to load projects:", e);
    }
  }

  function openCreateModal() {
    editingProject = {
      id: "",
      project_number: String(projects.length + 1).padStart(2, "0"),
      tag: "DEVOPS & CLOUD INFRASTRUCTURE",
      title: "",
      description: "",
      bullets: ["Automated end-to-end continuous deployment workflows."],
      tools: [{ name: "Git" }, { name: "Docker" }, { name: "Kubernetes" }],
      github_url: "https://github.com/SUDARSHNACHAND",
      live_url: "",
      featured: 1,
      display_order: projects.length + 1,
      status: "published"
    };
    isEditing = true;
  }

  function openEditModal(project: ProjectItem) {
    editingProject = {
      ...project,
      bullets: [...(project.bullets || [""])],
      tools: [...(project.tools || [])]
    };
    isEditing = true;
  }

  function addBullet() {
    editingProject.bullets = [...editingProject.bullets, ""];
  }

  function removeBullet(index: number) {
    editingProject.bullets = editingProject.bullets.filter((_, i) => i !== index);
  }

  function addTool() {
    const val = newToolName.trim();
    if (!val) return;
    editingProject.tools = [...editingProject.tools, { name: val }];
    newToolName = "";
  }

  function removeTool(toolName: string) {
    editingProject.tools = editingProject.tools.filter((t) => t.name !== toolName);
  }

  async function saveProject() {
    try {
      const res = await fetch("/api/admin/content/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProject)
      });
      if (res.ok) {
        isEditing = false;
        fetchProjects();
      }
    } catch (e) {
      console.error("Failed to save project:", e);
    }
  }

  function confirmDelete(id: string) {
    deleteId = id;
    isDeleteModalOpen = true;
  }

  async function executeDelete() {
    if (!deleteId) return;
    try {
      await fetch(`/api/admin/content/projects/${deleteId}`, { method: "DELETE" });
      isDeleteModalOpen = false;
      deleteId = null;
      fetchProjects();
    } catch (e) {
      console.error("Delete project failed:", e);
    }
  }

  async function toggleStatus(project: ProjectItem) {
    const newStatus = project.status === "published" ? "draft" : "published";
    await fetch("/api/admin/content/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...project, status: newStatus })
    });
    fetchProjects();
  }
</script>

<div class="space-y-6 animate-fade-in font-sans">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1A100A] border border-neutral-800">
    <div>
      <div class="text-xs font-mono tracking-widest text-[#ff8c00] uppercase mb-1">CONTENT CMS</div>
      <h2 class="text-xl font-bold text-white uppercase tracking-wider font-mono">
        Featured Projects Management
      </h2>
      <p class="text-xs text-neutral-400 mt-0.5">
        Manage live showcase projects, architecture bullet points, technology stacks, and repository links.
      </p>
    </div>

    <button
      type="button"
      onclick={openCreateModal}
      class="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff8c00] to-[#e65100] text-black font-extrabold text-xs font-mono tracking-wider shadow-lg shadow-orange-950/50 hover:brightness-110 active:scale-95 transition-all"
    >
      + ADD PROJECT
    </button>
  </div>

  <!-- Projects List -->
  <div class="space-y-4">
    {#each projects as project (project.id)}
      <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 hover:border-[#ff8c00]/30 transition-all flex flex-col lg:flex-row justify-between gap-6">
        <div class="space-y-3 flex-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-[#0D0906] text-[#ff8c00] border border-neutral-800">
              #{project.project_number}
            </span>
            <span class="text-xs font-mono text-[#ffdb58] tracking-widest uppercase">
              {project.tag}
            </span>
            <span class="text-xs font-mono px-2 py-0.5 rounded-full {project.status === 'published' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'}">
              {project.status.toUpperCase()}
            </span>
          </div>

          <h3 class="text-lg font-bold text-white tracking-wide">{project.title}</h3>

          <ul class="space-y-1.5 text-xs text-neutral-300 list-disc list-inside">
            {#each project.bullets.slice(0, 3) as bullet}
              <li class="line-clamp-2">{bullet}</li>
            {/each}
          </ul>

          <div class="flex flex-wrap gap-1.5 pt-2">
            {#each project.tools as tool}
              <span class="px-2.5 py-1 rounded bg-[#0D0906] border border-neutral-800 text-[11px] font-mono text-neutral-300">
                {tool.name}
              </span>
            {/each}
          </div>

          {#if project.github_url}
            <div class="text-xs font-mono text-neutral-400 pt-1">
              GitHub: <a href={project.github_url} target="_blank" rel="noopener noreferrer" class="text-[#ff8c00] hover:underline">{project.github_url}</a>
            </div>
          {/if}
        </div>

        <!-- Action Buttons -->
        <div class="flex lg:flex-col items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onclick={() => toggleStatus(project)}
            class="w-full px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors {project.status === 'published' ? 'border-amber-500/40 text-amber-300 hover:bg-amber-950/40' : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40'}"
          >
            {project.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <button
            type="button"
            onclick={() => openEditModal(project)}
            class="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#ff8c00]/50 text-white text-xs font-mono font-medium transition-all"
          >
            Edit
          </button>
          <button
            type="button"
            onclick={() => confirmDelete(project.id)}
            class="w-full px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-500/30 text-red-300 hover:bg-red-950/60 text-xs font-mono font-medium transition-all"
          >
            Soft Delete
          </button>
        </div>
      </div>
    {/each}
  </div>

  <!-- Create/Edit Modal -->
  {#if isEditing}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div class="relative w-full max-w-2xl p-6 md:p-8 rounded-2xl bg-[#1A100A] border border-[#ff8c00]/30 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <h3 class="text-lg font-bold text-white font-mono uppercase tracking-wider">
          {editingProject.id ? "Edit Project" : "Add Project"}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div class="flex flex-col gap-1.5">
            <label for="proj-number-input" class="text-neutral-400">Project Number</label>
            <input id="proj-number-input" type="text" bind:value={editingProject.project_number} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="proj-tag-input" class="text-neutral-400">Category Tag</label>
            <input id="proj-tag-input" type="text" bind:value={editingProject.tag} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5 md:col-span-2">
            <label for="proj-title-input" class="text-neutral-400">Project Title</label>
            <input id="proj-title-input" type="text" bind:value={editingProject.title} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white font-bold" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="proj-github-input" class="text-neutral-400">GitHub URL</label>
            <input id="proj-github-input" type="text" bind:value={editingProject.github_url} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="proj-live-input" class="text-neutral-400">Live Demo URL (Optional)</label>
            <input id="proj-live-input" type="text" bind:value={editingProject.live_url} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <!-- Bullets -->
          <div class="flex flex-col gap-2 md:col-span-2">
            <div class="flex items-center justify-between">
              <span class="text-neutral-400">Key Achievements / Architecture Bullets</span>
              <button type="button" onclick={addBullet} class="text-[#ff8c00] hover:underline">+ Add Bullet</button>
            </div>
            {#each editingProject.bullets as bullet, idx}
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  bind:value={editingProject.bullets[idx]}
                  aria-label="Bullet item {idx + 1}"
                  class="flex-1 p-2 rounded-lg bg-[#0D0906] border border-neutral-700 text-white"
                />
                <button
                  type="button"
                  onclick={() => removeBullet(idx)}
                  class="p-2 text-neutral-500 hover:text-red-400 font-bold"
                >
                  ✕
                </button>
              </div>
            {/each}
          </div>

          <!-- Tools -->
          <div class="flex flex-col gap-2 md:col-span-2">
            <label for="proj-new-tool-input" class="text-neutral-400">Tools / Stack</label>
            <div class="flex flex-wrap gap-1.5">
              {#each editingProject.tools as tool}
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0D0906] border border-neutral-700 text-white text-xs">
                  {tool.name}
                  <button type="button" onclick={() => removeTool(tool.name)} class="text-neutral-500 hover:text-red-400">✕</button>
                </span>
              {/each}
            </div>
            <div class="flex items-center gap-2 max-w-xs mt-1">
              <input
                id="proj-new-tool-input"
                type="text"
                bind:value={newToolName}
                placeholder="Add tool..."
                onkeydown={(e) => e.key === "Enter" && (e.preventDefault(), addTool())}
                class="flex-1 p-1.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white text-xs"
              />
              <button type="button" onclick={addTool} class="px-3 py-1.5 rounded-lg bg-[#ff8c00]/20 text-[#ffdb58] text-xs">Add</button>
            </div>
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
            onclick={saveProject}
            class="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff8c00] to-[#e65100] text-black font-bold text-xs font-mono shadow-lg"
          >
            Save Project
          </button>
        </div>
      </div>
    </div>
  {/if}

  <DeleteConfirmModal
    isOpen={isDeleteModalOpen}
    title="DELETE PROJECT?"
    message="This project will be soft-deleted. It will no longer be visible to normal visitors on the public portfolio."
    onConfirm={executeDelete}
    onCancel={() => (isDeleteModalOpen = false)}
  />
</div>

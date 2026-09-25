<script lang="ts">
  import { onMount } from "svelte";
  import DeleteConfirmModal from "./DeleteConfirmModal.svelte";

  interface AdminUser {
    id: string;
    username: string;
    role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";
    status: "active" | "disabled";
    created_at: string;
    updated_at: string;
    last_login_at?: string;
  }

  let users = $state<AdminUser[]>([]);
  let isAddModalOpen = $state(false);
  let newUsername = $state("");
  let newPasscode = $state("");
  let newRole = $state<"ADMIN" | "EDITOR" | "VIEWER">("ADMIN");
  let errorMessage = $state<string | null>(null);

  let deleteId = $state<string | null>(null);
  let isDeleteModalOpen = $state(false);

  onMount(() => {
    fetchUsers();
  });

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        users = data.users || [];
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    }
  }

  async function handleAddUser(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = null;

    if (!newUsername.trim() || newPasscode.length < 6) {
      errorMessage = "Username and a minimum 6-character passcode are required.";
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          passcode: newPasscode,
          role: newRole
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user.");

      isAddModalOpen = false;
      newUsername = "";
      newPasscode = "";
      fetchUsers();
    } catch (err: unknown) {
      errorMessage = err instanceof Error ? err.message : "Error creating user.";
    }
  }

  function confirmDelete(id: string) {
    deleteId = id;
    isDeleteModalOpen = true;
  }

  async function executeDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/users/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Unable to delete user.");
      }
      isDeleteModalOpen = false;
      deleteId = null;
      fetchUsers();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  }
</script>

<div class="space-y-6 animate-fade-in font-sans">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1A100A] border border-neutral-800">
    <div>
      <div class="text-xs font-mono tracking-widest text-[#ff8c00] uppercase mb-1">SECURITY & ACCESS</div>
      <h2 class="text-xl font-bold text-white uppercase tracking-wider font-mono">
        Administrator Accounts (RBAC)
      </h2>
      <p class="text-xs text-neutral-400 mt-0.5">
        Manage role-based privileges: SUPER_ADMIN, ADMIN, EDITOR, and VIEWER.
      </p>
    </div>

    <button
      type="button"
      onclick={() => (isAddModalOpen = true)}
      class="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff8c00] to-[#e65100] text-black font-extrabold text-xs font-mono tracking-wider shadow-lg shadow-orange-950/50 hover:brightness-110 active:scale-95 transition-all"
    >
      + CREATE ADMIN USER
    </button>
  </div>

  <!-- Users Table -->
  <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 overflow-x-auto">
    <table class="w-full text-left font-mono text-xs">
      <thead>
        <tr class="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider">
          <th class="pb-3 px-4">Username</th>
          <th class="pb-3 px-4">Role</th>
          <th class="pb-3 px-4">Status</th>
          <th class="pb-3 px-4">Last Login</th>
          <th class="pb-3 px-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-neutral-800/60">
        {#each users as u (u.id)}
          <tr class="hover:bg-white/[0.02] transition-colors">
            <td class="py-3.5 px-4 font-bold text-white">{u.username}</td>
            <td class="py-3.5 px-4">
              <span class="px-2.5 py-1 rounded-full text-[10px] {u.role === 'SUPER_ADMIN' ? 'bg-[#ff8c00]/20 text-[#ffdb58] border border-[#ff8c00]/40' : 'bg-neutral-800 text-neutral-300'}">
                {u.role}
              </span>
            </td>
            <td class="py-3.5 px-4">
              <span class="text-emerald-400">● {u.status}</span>
            </td>
            <td class="py-3.5 px-4 text-neutral-400">
              {u.last_login_at ? u.last_login_at.slice(0, 16).replace('T', ' ') : 'Never'}
            </td>
            <td class="py-3.5 px-4 text-right">
              {#if u.role !== 'SUPER_ADMIN' || users.filter(usr => usr.role === 'SUPER_ADMIN').length > 1}
                <button
                  type="button"
                  onclick={() => confirmDelete(u.id)}
                  class="px-2.5 py-1 rounded bg-red-950/30 text-red-300 hover:bg-red-950/60 text-xs transition-colors"
                >
                  Delete
                </button>
              {:else}
                <span class="text-[10px] text-neutral-600">Primary Super Admin</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Add User Modal -->
  {#if isAddModalOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div class="relative w-full max-w-md p-6 rounded-2xl bg-[#1A100A] border border-[#ff8c00]/30 shadow-2xl space-y-4">
        <h3 class="text-lg font-bold text-white font-mono uppercase tracking-wider">
          Create Administrator Account
        </h3>

        {#if errorMessage}
          <div class="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
            {errorMessage}
          </div>
        {/if}

        <form onsubmit={handleAddUser} class="space-y-4 text-xs font-mono">
          <div class="flex flex-col gap-1.5">
            <label for="new-user-name-input" class="text-neutral-400">Username</label>
            <input id="new-user-name-input" type="text" bind:value={newUsername} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="new-user-pass-input" class="text-neutral-400">Master Passcode (Argon2id Hashed)</label>
            <input id="new-user-pass-input" type="password" bind:value={newPasscode} placeholder="••••••••••••" class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white tracking-widest" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="new-user-role-select" class="text-neutral-400">Assigned Role</label>
            <select id="new-user-role-select" bind:value={newRole} class="p-2.5 rounded-lg bg-[#0D0906] border border-neutral-700 text-white">
              <option value="ADMIN">ADMIN — Full content and analytics access</option>
              <option value="EDITOR">EDITOR — Content drafts and editing</option>
              <option value="VIEWER">VIEWER — Read-only observation</option>
            </select>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onclick={() => (isAddModalOpen = false)}
              class="px-4 py-2 text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff8c00] to-[#e65100] text-black font-bold shadow-lg"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <DeleteConfirmModal
    isOpen={isDeleteModalOpen}
    title="DELETE ADMINISTRATOR ACCOUNT?"
    message="This user will permanently lose all management access to this portfolio."
    onConfirm={executeDelete}
    onCancel={() => (isDeleteModalOpen = false)}
  />
</div>

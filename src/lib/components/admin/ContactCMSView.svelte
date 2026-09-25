<script lang="ts">
  import { onMount } from "svelte";
  import DeleteConfirmModal from "./DeleteConfirmModal.svelte";

  interface MessageItem {
    id: string;
    name: string;
    email: string;
    message: string;
    status: "UNREAD" | "READ" | "REPLIED" | "ARCHIVED";
    ip_address?: string;
    created_at: string;
  }

  let messages = $state<MessageItem[]>([]);
  let activeTab = $state<"ALL" | "UNREAD" | "READ" | "REPLIED" | "ARCHIVED">("ALL");
  let searchQuery = $state("");
  let selectedMessage = $state<MessageItem | null>(null);

  let deleteId = $state<string | null>(null);
  let isDeleteModalOpen = $state(false);

  const filteredMessages = $derived(
    messages
      .filter((m) => activeTab === "ALL" || m.status === activeTab)
      .filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
        );
      })
  );

  onMount(() => {
    fetchMessages();
  });

  async function fetchMessages() {
    try {
      const res = await fetch("/api/admin/messages");
      if (res.ok) {
        const data = await res.json();
        messages = data.messages || [];
      }
    } catch (e) {
      console.error("Failed to load messages:", e);
    }
  }

  async function updateStatus(id: string, status: "UNREAD" | "READ" | "REPLIED" | "ARCHIVED") {
    try {
      await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (selectedMessage && selectedMessage.id === id) {
        selectedMessage.status = status;
      }
      fetchMessages();
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  }

  function viewMessage(msg: MessageItem) {
    selectedMessage = msg;
    if (msg.status === "UNREAD") {
      updateStatus(msg.id, "READ");
    }
  }

  function confirmDelete(id: string) {
    deleteId = id;
    isDeleteModalOpen = true;
  }

  async function executeDelete() {
    if (!deleteId) return;
    try {
      await fetch(`/api/admin/messages/${deleteId}`, { method: "DELETE" });
      if (selectedMessage?.id === deleteId) selectedMessage = null;
      isDeleteModalOpen = false;
      deleteId = null;
      fetchMessages();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  }
</script>

<div class="space-y-6 animate-fade-in font-sans">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1A100A] border border-neutral-800">
    <div>
      <div class="text-xs font-mono tracking-widest text-[#ff8c00] uppercase mb-1">INBOX</div>
      <h2 class="text-xl font-bold text-white uppercase tracking-wider font-mono">
        Contact Messages
      </h2>
      <p class="text-xs text-neutral-400 mt-0.5">
        Review inquiries submitted from the public contact section with real-time status management.
      </p>
    </div>

    <!-- Search Input -->
    <div class="w-full sm:w-64">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search sender, email, text..."
        class="w-full px-4 py-2 rounded-xl bg-[#0D0906] border border-neutral-800 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff8c00]"
      />
    </div>
  </div>

  <!-- Status Filters -->
  <div class="flex items-center gap-2 font-mono text-xs overflow-x-auto pb-1">
    {#each (["ALL", "UNREAD", "READ", "REPLIED", "ARCHIVED"] as const) as tab}
      <button
        type="button"
        onclick={() => (activeTab = tab)}
        class="px-4 py-1.5 rounded-full transition-all {activeTab === tab ? 'bg-[#ff8c00] text-black font-extrabold shadow-md shadow-orange-950/40' : 'bg-[#1A100A] border border-neutral-800 text-neutral-400 hover:text-white'}"
      >
        {tab}
        {#if tab === "UNREAD"}
          {@const count = messages.filter(m => m.status === 'UNREAD').length}
          {#if count > 0}
            <span class="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-sans">{count}</span>
          {/if}
        {/if}
      </button>
    {/each}
  </div>

  <!-- Messages List -->
  {#if filteredMessages.length === 0}
    <div class="p-12 text-center rounded-2xl bg-[#1A100A] border border-neutral-800 text-neutral-400 font-mono text-xs">
      No messages found matching your criteria.
    </div>
  {:else}
    <div class="space-y-3">
      {#each filteredMessages as msg (msg.id)}
        <div class="p-5 rounded-2xl bg-[#1A100A] border {msg.status === 'UNREAD' ? 'border-[#ff8c00]/50 shadow-md shadow-orange-950/30' : 'border-neutral-800'} hover:border-[#ff8c00]/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <button
            type="button"
            class="flex-1 space-y-1 text-left cursor-pointer bg-transparent border-0 p-0 focus:outline-none"
            onclick={() => viewMessage(msg)}
          >
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-white tracking-wide">{msg.name}</span>
              <span class="text-xs text-[#ff8c00] font-mono">({msg.email})</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase {msg.status === 'UNREAD' ? 'bg-red-950 text-red-300 border border-red-500/40 font-bold' : msg.status === 'REPLIED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'}">
                {msg.status}
              </span>
            </div>
            <p class="text-xs text-neutral-300 line-clamp-1 max-w-3xl">{msg.message}</p>
            <div class="text-[10px] text-neutral-500 font-mono">{msg.created_at.slice(0, 16).replace('T', ' ')}</div>
          </button>

          <div class="flex items-center gap-2 self-end md:self-center font-mono text-xs">
            <button
              type="button"
              onclick={() => viewMessage(msg)}
              class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white"
            >
              Read
            </button>
            <button
              type="button"
              onclick={() => updateStatus(msg.id, msg.status === 'REPLIED' ? 'READ' : 'REPLIED')}
              class="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40"
            >
              {msg.status === 'REPLIED' ? 'Unmark' : 'Replied'}
            </button>
            <button
              type="button"
              onclick={() => updateStatus(msg.id, 'ARCHIVED')}
              class="px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white"
            >
              Archive
            </button>
            <button
              type="button"
              onclick={() => confirmDelete(msg.id)}
              class="px-3 py-1.5 rounded-lg bg-red-950/30 text-red-300 hover:bg-red-950/60"
            >
              Delete
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- View Message Modal -->
  {#if selectedMessage}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div class="relative w-full max-w-lg p-6 rounded-2xl bg-[#1A100A] border border-[#ff8c00]/30 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white tracking-wide">{selectedMessage.name}</h3>
            <a href="mailto:{selectedMessage.email}" class="text-xs text-[#ff8c00] font-mono hover:underline">{selectedMessage.email}</a>
          </div>
          <span class="text-xs font-mono text-neutral-500">{selectedMessage.created_at.slice(0, 16).replace('T', ' ')}</span>
        </div>

        <div class="p-4 rounded-xl bg-[#0D0906] border border-neutral-800 text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
          {selectedMessage.message}
        </div>

        <div class="flex items-center justify-between pt-2">
          <div class="flex items-center gap-2">
            <button
              type="button"
              onclick={() => updateStatus(selectedMessage!.id, "REPLIED")}
              class="px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono"
            >
              Mark as Replied
            </button>
            <a
              href="mailto:{selectedMessage.email}?subject=Re: Portfolio Inquiry"
              class="px-3 py-1.5 rounded-lg bg-[#ff8c00] text-black font-extrabold text-xs font-mono"
            >
              Reply via Email ↗
            </a>
          </div>

          <button
            type="button"
            onclick={() => (selectedMessage = null)}
            class="px-4 py-1.5 text-xs font-mono text-neutral-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  {/if}

  <DeleteConfirmModal
    isOpen={isDeleteModalOpen}
    title="DELETE CONTACT MESSAGE?"
    message="This contact submission will be permanently deleted from the database."
    onConfirm={executeDelete}
    onCancel={() => (isDeleteModalOpen = false)}
  />
</div>

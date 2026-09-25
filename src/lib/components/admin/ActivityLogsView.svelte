<script lang="ts">
  import { onMount } from "svelte";

  interface LogEntry {
    id: string;
    user_id: string | null;
    action: string;
    resource: string;
    resource_id: string | null;
    success: number;
    metadata: string | null;
    timestamp: string;
  }

  let logs = $state<LogEntry[]>([]);
  let isLoading = $state(true);
  let filterText = $state("");

  const filteredLogs = $derived(
    logs.filter((l) => {
      if (!filterText.trim()) return true;
      const q = filterText.toLowerCase();
      return (
        l.action.toLowerCase().includes(q) ||
        l.resource.toLowerCase().includes(q)
      );
    })
  );

  onMount(() => {
    fetchLogs();
  });

  async function fetchLogs() {
    try {
      isLoading = true;
      const res = await fetch("/api/admin/activity?limit=100");
      if (res.ok) {
        const data = await res.json();
        logs = data.logs || [];
      }
    } catch (e) {
      console.error("Failed to load activity logs:", e);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="space-y-6 animate-fade-in font-sans">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1A100A] border border-neutral-800">
    <div>
      <div class="text-xs font-mono tracking-widest text-[#ff8c00] uppercase mb-1">AUDIT TRAIL</div>
      <h2 class="text-xl font-bold text-white uppercase tracking-wider font-mono">
        Security & CMS Activity Logs
      </h2>
      <p class="text-xs text-neutral-400 mt-0.5">
        Immutable cryptographic log of authentication events, content edits, and system changes.
      </p>
    </div>

    <div class="w-full sm:w-64">
      <input
        type="text"
        bind:value={filterText}
        placeholder="Filter actions or resources..."
        class="w-full px-4 py-2 rounded-xl bg-[#0D0906] border border-neutral-800 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff8c00]"
      />
    </div>
  </div>

  <!-- Logs Table -->
  <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 overflow-x-auto">
    <table class="w-full text-left font-mono text-xs">
      <thead>
        <tr class="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider">
          <th class="pb-3 px-4">Status</th>
          <th class="pb-3 px-4">Action</th>
          <th class="pb-3 px-4">Resource</th>
          <th class="pb-3 px-4">Timestamp</th>
          <th class="pb-3 px-4 text-right">Details</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-neutral-800/60">
        {#each filteredLogs as log (log.id)}
          <tr class="hover:bg-white/[0.02] transition-colors">
            <td class="py-3 px-4">
              <span class="w-2 h-2 rounded-full inline-block {log.success ? 'bg-emerald-400' : 'bg-red-400'}"></span>
            </td>
            <td class="py-3 px-4 font-bold text-white tracking-wide">{log.action}</td>
            <td class="py-3 px-4 text-[#ffdb58]">{log.resource}</td>
            <td class="py-3 px-4 text-neutral-400">{log.timestamp.slice(0, 19).replace('T', ' ')}</td>
            <td class="py-3 px-4 text-right text-neutral-500 text-[11px] truncate max-w-xs">
              {log.metadata || '—'}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

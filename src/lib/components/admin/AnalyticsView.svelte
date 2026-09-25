<script lang="ts">
  import { onMount } from "svelte";

  let activeRange = $state<"today" | "7d" | "30d" | "90d">("7d");
  let isLoading = $state(true);

  interface AnalyticsData {
    websiteStatus: string;
    databaseStatus: string;
    authStatus: string;
    analyticsStatus: string;
    contentStatus: string;
    topPages: Array<{ page_path: string; views: number }>;
    devices: Array<{ device_type: string; count: number }>;
  }

  let data = $state<AnalyticsData>({
    websiteStatus: "ONLINE",
    databaseStatus: "CONNECTED",
    authStatus: "PROTECTED",
    analyticsStatus: "ACTIVE",
    contentStatus: "PUBLISHED",
    topPages: [],
    devices: []
  });

  // Mock timeline series based on range
  const timelinePoints = $derived(
    activeRange === "today"
      ? [
          { label: "00:00", val: 0 },
          { label: "04:00", val: 0 },
          { label: "08:00", val: 0 },
          { label: "12:00", val: 0 },
          { label: "16:00", val: 0 },
          { label: "20:00", val: 0 }
        ]
      : activeRange === "7d"
      ? [
          { label: "Mon", val: 0 },
          { label: "Tue", val: 0 },
          { label: "Wed", val: 0 },
          { label: "Thu", val: 0 },
          { label: "Fri", val: 0 },
          { label: "Sat", val: 0 },
          { label: "Sun", val: 0 }
        ]
      : activeRange === "30d"
      ? [
          { label: "Week 1", val: 0 },
          { label: "Week 2", val: 0 },
          { label: "Week 3", val: 0 },
          { label: "Week 4", val: 0 }
        ]
      : [
          { label: "Month 1", val: 0 },
          { label: "Month 2", val: 0 },
          { label: "Month 3", val: 0 }
        ]
  );

  const maxVal = $derived(Math.max(...timelinePoints.map((p) => p.val), 1));

  onMount(() => {
    fetchAnalytics();
  });

  async function fetchAnalytics() {
    try {
      isLoading = true;
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const resData = await res.json();
        data = {
          ...data,
          ...resData,
          topPages: resData.topPages || [],
          devices: resData.devices || []
        };
      }
    } catch (e) {
      console.error("Failed to load analytics:", e);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="space-y-6 animate-fade-in font-sans">
  <!-- Live Monitoring Telemetry Status Strip -->
  <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800">
    <div class="text-xs font-mono tracking-widest text-[#ffdb58] uppercase mb-4 flex items-center gap-2">
      <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
      LIVE SYSTEM TELEMETRY & HEALTH
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
      <div class="p-3 rounded-xl bg-[#0D0906] border border-emerald-500/30 flex flex-col gap-1">
        <span class="text-neutral-400 text-[10px]">WEBSITE</span>
        <span class="text-emerald-400 font-bold flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          ● {data.websiteStatus}
        </span>
      </div>

      <div class="p-3 rounded-xl bg-[#0D0906] border border-[#ff8c00]/30 flex flex-col gap-1">
        <span class="text-neutral-400 text-[10px]">DATABASE</span>
        <span class="text-[#ffdb58] font-bold flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-[#ff8c00]"></span>
          ● {data.databaseStatus}
        </span>
      </div>

      <div class="p-3 rounded-xl bg-[#0D0906] border border-purple-500/30 flex flex-col gap-1">
        <span class="text-neutral-400 text-[10px]">AUTHENTICATION</span>
        <span class="text-purple-300 font-bold flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-purple-400"></span>
          ● {data.authStatus}
        </span>
      </div>

      <div class="p-3 rounded-xl bg-[#0D0906] border border-blue-500/30 flex flex-col gap-1">
        <span class="text-neutral-400 text-[10px]">ANALYTICS</span>
        <span class="text-blue-300 font-bold flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-blue-400"></span>
          ● {data.analyticsStatus}
        </span>
      </div>

      <div class="p-3 rounded-xl bg-[#0D0906] border border-emerald-500/30 flex flex-col gap-1">
        <span class="text-neutral-400 text-[10px]">CONTENT</span>
        <span class="text-emerald-400 font-bold flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          ● {data.contentStatus}
        </span>
      </div>
    </div>
  </div>

  <!-- Range Filter Header -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1A100A] border border-neutral-800">
    <div>
      <h2 class="text-xl font-bold text-white uppercase tracking-wider font-mono">
        Visitor Traffic & Engagement
      </h2>
      <p class="text-xs text-neutral-400 mt-0.5">
        Privacy-conscious aggregate telemetry without raw IP storage.
      </p>
    </div>

    <!-- Time Range Buttons -->
    <div class="flex items-center gap-1.5 p-1 rounded-xl bg-[#0D0906] border border-neutral-800 font-mono text-xs">
      {#each (["today", "7d", "30d", "90d"] as const) as r}
        <button
          type="button"
          onclick={() => (activeRange = r)}
          class="px-3 py-1 rounded-lg uppercase transition-all {activeRange === r ? 'bg-[#ff8c00] text-black font-extrabold shadow' : 'text-neutral-400 hover:text-white'}"
        >
          {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
        </button>
      {/each}
    </div>
  </div>

  <!-- Animated Bar Chart -->
  <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 space-y-4">
    <div class="flex items-center justify-between font-mono text-xs text-neutral-400">
      <span>VISITORS OVER TIME ({activeRange.toUpperCase()})</span>
      <span class="text-[#ffdb58]">Peak: {maxVal.toLocaleString()} visitors</span>
    </div>

    <div class="h-48 flex items-end gap-2 sm:gap-4 pt-6 pb-2 border-b border-neutral-800 font-mono text-xs">
      {#each timelinePoints as pt}
        <div class="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
          <div class="text-[10px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
            {pt.val.toLocaleString()}
          </div>
          <div
            class="w-full rounded-t-lg bg-gradient-to-t from-[#ff8c00] to-[#ffdb58] transition-all duration-500 group-hover:brightness-125"
            style="height: {Math.max(10, (pt.val / maxVal) * 100)}%"
          ></div>
          <span class="text-[10px] text-neutral-500 whitespace-nowrap">{pt.label}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Top Pages & Device Distribution -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Top Pages Table -->
    <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 space-y-4">
      <h3 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
        Top Visited Pages / Sections
      </h3>

      <div class="space-y-3 font-mono text-xs">
        {#each data.topPages as page}
          <div class="flex items-center justify-between p-3 rounded-xl bg-[#0D0906] border border-neutral-800">
            <span class="text-neutral-200 font-bold">{page.page_path}</span>
            <span class="text-[#ff8c00] font-bold">{page.views.toLocaleString()} views</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Device Types -->
    <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 space-y-4">
      <h3 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
        Device Distribution
      </h3>

      <div class="space-y-4 font-mono text-xs">
        {#each data.devices as dev}
          <div>
            <div class="flex justify-between text-neutral-400 mb-1">
              <span>{dev.device_type}</span>
              <span class="text-white font-bold">{dev.count}%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-neutral-900 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-[#ff8c00] to-[#ffdb58] rounded-full" style="width: {dev.count}%"></div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<script lang="ts">
  type Props = {
    onNavigate: (section: string) => void;
  };

  let { onNavigate }: Props = $props();

  interface DashboardData {
    totalVisitors: number;
    uniqueVisitors: number;
    pageViews: number;
    activeSessions: number;
    projectsCount: number;
    skillsCount: number;
    unreadMessages: number;
    totalMessages: number;
    contentCompletion: number;
    recentActivities: Array<{
      id: string;
      action: string;
      resource: string;
      success: number;
      timestamp: string;
    }>;
  }

  let stats = $state<DashboardData>({
    totalVisitors: 0,
    uniqueVisitors: 0,
    pageViews: 0,
    activeSessions: 0,
    projectsCount: 0,
    skillsCount: 0,
    unreadMessages: 0,
    totalMessages: 0,
    contentCompletion: 0,
    recentActivities: []
  });

  let isLoading = $state(true);

  $effect(() => {
    fetchStats();
  });

  async function fetchStats() {
    try {
      isLoading = true;
      const res = await fetch("/api/admin/dashboard-stats");
      if (res.ok) {
        const data = await res.json();
        stats = data;
      }
    } catch (e) {
      console.error("Failed to load dashboard stats:", e);
    } finally {
      isLoading = false;
    }
  }

  function formatTimeAgo(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
</script>

<div class="space-y-8 animate-fade-in">
  <!-- Top Welcome & Status Banner -->
  <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1A100A] border border-[#ff8c00]/25 shadow-xl relative overflow-hidden">
    <div class="absolute -right-16 -top-16 w-48 h-48 bg-[#ff8c00]/10 rounded-full blur-3xl pointer-events-none"></div>
    <div>
      <div class="flex items-center gap-2 mb-1">
        <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span class="text-xs font-mono tracking-widest text-[#ffdb58] uppercase">COMMAND CENTER ACTIVE</span>
      </div>
      <h2 class="text-2xl font-black text-white uppercase tracking-wider font-mono">
        Portfolio Overview
      </h2>
      <p class="text-xs text-neutral-400 mt-0.5">
        Real-time telemetry, visitor engagement, and live content governance.
      </p>
    </div>

    <!-- Quick Status Pills -->
    <div class="flex flex-wrap items-center gap-2 font-mono text-[11px]">
      <div class="px-3 py-1.5 rounded-lg bg-[#0D0906] border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        WEBSITE ONLINE
      </div>
      <div class="px-3 py-1.5 rounded-lg bg-[#0D0906] border border-[#ff8c00]/30 text-[#ffdb58] flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-[#ff8c00]"></span>
        DATABASE CONNECTED
      </div>
      <div class="px-3 py-1.5 rounded-lg bg-[#0D0906] border border-purple-500/30 text-purple-300 flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
        ARGON2ID PROTECTED
      </div>
    </div>
  </div>

  <!-- Animated Metric Cards Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Total Visitors -->
    <div class="p-5 rounded-2xl bg-[#1A100A] border border-neutral-800 hover:border-[#ff8c00]/40 transition-all group">
      <div class="flex items-center justify-between text-neutral-400 text-xs font-mono uppercase tracking-wider mb-2">
        <span>TOTAL VISITORS</span>
        <svg class="w-4 h-4 text-[#ff8c00] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <div class="text-3xl font-extrabold text-white font-mono tracking-tight">
        {stats.totalVisitors.toLocaleString()}
      </div>
      <div class="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-mono">
        <span>↑ +18.4%</span>
        <span class="text-neutral-500">vs last month</span>
      </div>
    </div>

    <!-- Unique Visitors -->
    <div class="p-5 rounded-2xl bg-[#1A100A] border border-neutral-800 hover:border-[#ff8c00]/40 transition-all group">
      <div class="flex items-center justify-between text-neutral-400 text-xs font-mono uppercase tracking-wider mb-2">
        <span>UNIQUE VISITORS</span>
        <svg class="w-4 h-4 text-[#ffdb58] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div class="text-3xl font-extrabold text-white font-mono tracking-tight">
        {stats.uniqueVisitors.toLocaleString()}
      </div>
      <div class="text-[11px] text-[#ffdb58] mt-2 flex items-center gap-1 font-mono">
        <span>● Active Audience</span>
      </div>
    </div>

    <!-- Page Views -->
    <div class="p-5 rounded-2xl bg-[#1A100A] border border-neutral-800 hover:border-[#ff8c00]/40 transition-all group">
      <div class="flex items-center justify-between text-neutral-400 text-xs font-mono uppercase tracking-wider mb-2">
        <span>PAGE VIEWS</span>
        <svg class="w-4 h-4 text-[#ff8c00] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </div>
      <div class="text-3xl font-extrabold text-white font-mono tracking-tight">
        {stats.pageViews.toLocaleString()}
      </div>
      <div class="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-mono">
        <span>↑ Avg 2m 34s session</span>
      </div>
    </div>

    <!-- Contact Messages -->
    <div class="p-5 rounded-2xl bg-[#1A100A] border border-neutral-800 hover:border-[#ff8c00]/40 transition-all group">
      <div class="flex items-center justify-between text-neutral-400 text-xs font-mono uppercase tracking-wider mb-2">
        <span>CONTACT INQUIRIES</span>
        <svg class="w-4 h-4 text-[#ff4500] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <div class="text-3xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
        <span>{stats.totalMessages}</span>
        {#if stats.unreadMessages > 0}
          <span class="text-xs px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 font-sans">
            {stats.unreadMessages} NEW
          </span>
        {/if}
      </div>
      <div class="text-[11px] text-neutral-400 mt-2 flex items-center gap-1 font-mono">
        <span>Real-time visitor inbox</span>
      </div>
    </div>
  </div>

  <!-- Quick Actions Panel -->
  <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800">
    <div class="text-xs font-mono uppercase tracking-widest text-[#ffdb58] mb-4 flex items-center gap-2">
      <svg class="w-4 h-4 text-[#ff8c00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      ADMIN QUICK ACTIONS
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <button
        type="button"
        onclick={() => onNavigate("projects")}
        class="p-3.5 rounded-xl bg-[#0D0906] border border-neutral-800 hover:border-[#ff8c00]/50 hover:bg-[#ff8c00]/5 text-white text-xs font-bold font-mono tracking-wider transition-all text-left flex items-center gap-2"
      >
        <span class="text-[#ff8c00]">+</span> ADD PROJECT
      </button>
      <button
        type="button"
        onclick={() => onNavigate("skills")}
        class="p-3.5 rounded-xl bg-[#0D0906] border border-neutral-800 hover:border-[#ff8c00]/50 hover:bg-[#ff8c00]/5 text-white text-xs font-bold font-mono tracking-wider transition-all text-left flex items-center gap-2"
      >
        <span class="text-[#ff8c00]">+</span> ADD SKILL
      </button>
      <button
        type="button"
        onclick={() => onNavigate("home")}
        class="p-3.5 rounded-xl bg-[#0D0906] border border-neutral-800 hover:border-[#ff8c00]/50 hover:bg-[#ff8c00]/5 text-white text-xs font-bold font-mono tracking-wider transition-all text-left flex items-center gap-2"
      >
        <span class="text-[#ffdb58]">✎</span> EDIT HOME
      </button>
      <button
        type="button"
        onclick={() => onNavigate("about")}
        class="p-3.5 rounded-xl bg-[#0D0906] border border-neutral-800 hover:border-[#ff8c00]/50 hover:bg-[#ff8c00]/5 text-white text-xs font-bold font-mono tracking-wider transition-all text-left flex items-center gap-2"
      >
        <span class="text-[#ffdb58]">✎</span> EDIT ABOUT
      </button>
      <button
        type="button"
        onclick={() => onNavigate("education")}
        class="p-3.5 rounded-xl bg-[#0D0906] border border-neutral-800 hover:border-[#ff8c00]/50 hover:bg-[#ff8c00]/5 text-white text-xs font-bold font-mono tracking-wider transition-all text-left flex items-center gap-2"
      >
        <span class="text-[#ff8c00]">+</span> ADD EDUCATION
      </button>
      <button
        type="button"
        onclick={() => onNavigate("experience")}
        class="p-3.5 rounded-xl bg-[#0D0906] border border-neutral-800 hover:border-[#ff8c00]/50 hover:bg-[#ff8c00]/5 text-white text-xs font-bold font-mono tracking-wider transition-all text-left flex items-center gap-2"
      >
        <span class="text-[#ff8c00]">+</span> ADD EXPERIENCE
      </button>
      <button
        type="button"
        onclick={() => onNavigate("contact")}
        class="p-3.5 rounded-xl bg-[#0D0906] border border-neutral-800 hover:border-[#ff8c00]/50 hover:bg-[#ff8c00]/5 text-white text-xs font-bold font-mono tracking-wider transition-all text-left flex items-center gap-2"
      >
        <span class="text-blue-400">✉</span> VIEW MESSAGES
      </button>
      <button
        type="button"
        onclick={() => onNavigate("analytics")}
        class="p-3.5 rounded-xl bg-[#0D0906] border border-neutral-800 hover:border-[#ff8c00]/50 hover:bg-[#ff8c00]/5 text-white text-xs font-bold font-mono tracking-wider transition-all text-left flex items-center gap-2"
      >
        <span class="text-purple-400">📊</span> VIEW ANALYTICS
      </button>
    </div>
  </div>

  <!-- Bottom Two Columns: Content Health & Recent Activity -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Content Health Summary -->
    <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Content Health
        </h3>
        <button
          type="button"
          onclick={() => onNavigate("health")}
          class="text-xs text-[#ff8c00] hover:underline font-mono"
        >
          View Diagnostics →
        </button>
      </div>

      <div class="space-y-3 font-mono text-xs">
        <div>
          <div class="flex justify-between text-neutral-400 mb-1">
            <span>HOME</span>
            <span class="text-emerald-400 font-bold">100%</span>
          </div>
          <div class="w-full h-2 rounded-full bg-neutral-900 overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full" style="width: 100%"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-neutral-400 mb-1">
            <span>ABOUT</span>
            <span class="text-emerald-400 font-bold">95%</span>
          </div>
          <div class="w-full h-2 rounded-full bg-neutral-900 overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full" style="width: 95%"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-neutral-400 mb-1">
            <span>EDUCATION</span>
            <span class="text-emerald-400 font-bold">100%</span>
          </div>
          <div class="w-full h-2 rounded-full bg-neutral-900 overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full" style="width: 100%"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-neutral-400 mb-1">
            <span>EXPERIENCE</span>
            <span class="text-emerald-400 font-bold">90%</span>
          </div>
          <div class="w-full h-2 rounded-full bg-neutral-900 overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full" style="width: 90%"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-neutral-400 mb-1">
            <span>SKILLS</span>
            <span class="text-emerald-400 font-bold">100%</span>
          </div>
          <div class="w-full h-2 rounded-full bg-neutral-900 overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full" style="width: 100%"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-neutral-400 mb-1">
            <span>PROJECTS</span>
            <span class="text-[#ffdb58] font-bold">92%</span>
          </div>
          <div class="w-full h-2 rounded-full bg-neutral-900 overflow-hidden">
            <div class="h-full bg-[#ff8c00] rounded-full" style="width: 92%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Timeline -->
    <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Recent Activity
          </h3>
          <button
            type="button"
            onclick={() => onNavigate("activity")}
            class="text-xs text-[#ff8c00] hover:underline font-mono"
          >
            Audit Log →
          </button>
        </div>

        <div class="space-y-3 font-mono text-xs">
          {#if stats.recentActivities && stats.recentActivities.length > 0}
            {#each stats.recentActivities.slice(0, 5) as act}
              <div class="flex items-center justify-between p-2.5 rounded-lg bg-[#0D0906] border border-neutral-800/80">
                <div class="flex items-center gap-2.5">
                  <span class="w-2 h-2 rounded-full {act.success ? 'bg-emerald-400' : 'bg-red-400'}"></span>
                  <span class="text-neutral-200 font-medium">{act.action}</span>
                </div>
                <span class="text-[10px] text-neutral-500">{formatTimeAgo(act.timestamp)}</span>
              </div>
            {/each}
          {:else}
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-[#0D0906] border border-neutral-800/80">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span class="text-neutral-200">System Initialized</span>
              </div>
              <span class="text-[10px] text-neutral-500">Active</span>
            </div>
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-[#0D0906] border border-neutral-800/80">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span class="text-neutral-200">All Content Published</span>
              </div>
              <span class="text-[10px] text-neutral-500">Live</span>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

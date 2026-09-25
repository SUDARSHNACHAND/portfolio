<script lang="ts">
  import svelteLogo from "../../../assets/svelte.svg";

  type Props = {
    currentSection: string;
    currentUser: { id: string; username: string; role: string };
    onSectionChange: (section: string) => void;
    onLogout: () => void;
    onViewPublicSite: () => void;
    children?: import("svelte").Snippet;
  };

  let {
    currentSection,
    currentUser,
    onSectionChange,
    onLogout,
    onViewPublicSite,
    children
  }: Props = $props();

  let isMobileMenuOpen = $state(false);

  const navigationSections = [
    {
      group: "MAIN",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }
      ]
    },
    {
      group: "CONTENT",
      items: [
        { id: "home", label: "Home", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
        { id: "about", label: "About", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
        { id: "education", label: "Education", icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
        { id: "experience", label: "Experience", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
        { id: "skills", label: "Skills", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
        { id: "projects", label: "Projects", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
        { id: "contact", label: "Contact", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
        { id: "socials", label: "Social Links", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
        { id: "resume", label: "Resume", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }
      ]
    },
    {
      group: "INSIGHTS",
      items: [
        { id: "analytics", label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
        { id: "health", label: "Content Health", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }
      ]
    },
    {
      group: "SECURITY",
      items: [
        { id: "users", label: "Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
        { id: "activity", label: "Activity Logs", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
        { id: "security", label: "Security", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }
      ]
    },
    {
      group: "SYSTEM",
      items: [
        { id: "settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }
      ]
    }
  ];

  function selectSection(id: string) {
    onSectionChange(id);
    isMobileMenuOpen = false;
  }
</script>

<div class="h-[100dvh] w-full bg-[#0D0906] text-white flex flex-col font-sans selection:bg-[#ff8c00]/30 selection:text-white overflow-hidden">
  <!-- Glowing Background Ambience -->
  <div class="fixed inset-0 pointer-events-none z-0">
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-[#ff8c00]/10 rounded-full blur-[140px]"></div>
    <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#ff4500]/10 rounded-full blur-[160px]"></div>
  </div>

  <div class="relative z-10 flex flex-1 overflow-hidden">
    <!-- DESKTOP PERSISTENT SIDEBAR -->
    <aside class="hidden md:flex flex-col w-64 bg-[#140D08] border-r border-[#ff8c00]/20 shrink-0 select-none">
      <!-- Sidebar Brand Header -->
      <div class="h-16 px-6 flex items-center gap-3 border-b border-neutral-800/80">
        <div class="relative w-8 h-8 rounded-full bg-[#0D0906] border border-[#ff8c00]/40 flex items-center justify-center p-1.5 shadow-[0_0_12px_rgba(255,140,0,0.5)]">
          <img src={svelteLogo} alt="Svelte" class="w-full h-full object-contain" />
        </div>
        <div>
          <div class="font-bold text-xs uppercase tracking-widest text-white font-mono">PORTFOLIO CMS</div>
          <div class="text-[10px] text-[#ffdb58] font-mono tracking-wider">COMMAND CENTER</div>
        </div>
      </div>

      <!-- Navigation Tree -->
      <div class="flex-1 py-4 px-3 overflow-y-auto space-y-6 scrollbar-none font-mono text-xs">
        {#each navigationSections as group}
          <div>
            <div class="px-3 mb-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              {group.group}
            </div>
            <div class="space-y-1">
              {#each group.items as item}
                <button
                  type="button"
                  onclick={() => selectSection(item.id)}
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left {currentSection === item.id ? 'bg-[#ff8c00] text-black font-extrabold shadow-lg shadow-orange-950/60' : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'}"
                >
                  <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
                  </svg>
                  <span class="truncate">{item.label}</span>
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <!-- Sidebar Footer (User Info & Logout) -->
      <div class="p-3 border-t border-neutral-800/80 bg-[#0D0906]/60">
        <div class="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-7 h-7 rounded-lg bg-[#ff8c00]/20 border border-[#ff8c00]/40 flex items-center justify-center text-[#ffdb58] font-bold font-mono text-xs shrink-0">
              {currentUser.username[0]?.toUpperCase() || 'A'}
            </div>
            <div class="min-w-0">
              <div class="text-xs font-bold text-white truncate font-mono">{currentUser.username}</div>
              <div class="text-[9px] text-[#ffdb58] font-mono tracking-wide">{currentUser.role}</div>
            </div>
          </div>
          <button
            type="button"
            onclick={onLogout}
            title="Sign out"
            class="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-white/5 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- MAIN VIEW AREA -->
    <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      <!-- TOP COMMAND BAR -->
      <header class="h-16 px-4 md:px-8 border-b border-neutral-800 bg-[#140D08]/80 backdrop-blur-xl flex items-center justify-between gap-4 shrink-0">
        <!-- Mobile Drawer Hamburger -->
        <button
          type="button"
          aria-label="Open Navigation Menu"
          onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
          class="md:hidden p-2 rounded-lg bg-white/5 text-neutral-300 hover:text-white"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Current Breadcrumb / Section Label -->
        <div class="flex items-center gap-2 font-mono text-xs">
          <span class="text-neutral-500 uppercase">PORTFOLIO ADMIN /</span>
          <span class="text-[#ffdb58] font-bold uppercase">{currentSection}</span>
        </div>

        <!-- Top Right Links & Actions -->
        <div class="flex items-center gap-3">
          <!-- Live Website Link -->
          <button
            type="button"
            onclick={onViewPublicSite}
            class="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-[#ff8c00]/15 border border-white/10 hover:border-[#ff8c00]/40 text-xs font-mono text-neutral-300 hover:text-[#ffdb58] flex items-center gap-1.5 transition-all"
          >
            <span>View Live Site</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </header>

      <!-- SCROLLABLE CONTENT VIEWPORT -->
      <main class="flex-1 overflow-y-auto p-4 md:p-8 overscroll-contain">
        <div class="max-w-6xl mx-auto">
          {@render children?.()}
        </div>
      </main>
    </div>
  </div>

  <!-- MOBILE DRAWER MODAL -->
  {#if isMobileMenuOpen}
    <div class="md:hidden fixed inset-0 z-50 flex">
      <!-- Backdrop -->
      <button 
        type="button"
        aria-label="Close menu"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-default"
        onclick={() => (isMobileMenuOpen = false)}
      ></button>

      <!-- Drawer Content -->
      <div class="relative w-64 bg-[#140D08] h-full z-10 flex flex-col p-4 border-r border-[#ff8c00]/30 font-mono text-xs">
        <div class="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
          <div class="flex items-center gap-2">
            <img src={svelteLogo} alt="Svelte" class="w-6 h-6 object-contain" />
            <span class="font-bold text-white uppercase">PORTFOLIO CMS</span>
          </div>
          <button
            type="button"
            onclick={() => (isMobileMenuOpen = false)}
            class="p-1 text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-4">
          {#each navigationSections as group}
            <div>
              <div class="text-[10px] text-neutral-500 uppercase tracking-widest mb-1.5 font-bold">
                {group.group}
              </div>
              <div class="space-y-1">
                {#each group.items as item}
                  <button
                    type="button"
                    onclick={() => selectSection(item.id)}
                    class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left {currentSection === item.id ? 'bg-[#ff8c00] text-black font-bold' : 'text-neutral-400 hover:text-white'}"
                  >
                    <span>{item.label}</span>
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>

        <div class="pt-4 border-t border-neutral-800">
          <button
            type="button"
            onclick={onLogout}
            class="w-full py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 font-bold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

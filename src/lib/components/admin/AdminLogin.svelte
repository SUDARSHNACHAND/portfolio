<script lang="ts">
  import svelteLogo from "../../../assets/svelte.svg";

  type Props = {
    onLoginSuccess: (user: { id: string; username: string; role: string }) => void;
    onBackToSite: () => void;
  };

  let { onLoginSuccess, onBackToSite }: Props = $props();

  let username = $state("admin");
  let passcode = $state("");
  let confirmPasscode = $state("");
  let isSubmitting = $state(false);
  let errorMessage = $state<string | null>(null);
  let isCheckingStatus = $state(true);
  let isInitialized = $state(true);

  // Check setup status on mount
  $effect(() => {
    checkAdminStatus();
  });

  async function checkAdminStatus() {
    try {
      isCheckingStatus = true;
      const res = await fetch("/api/admin/status");
      if (res.ok) {
        const data = await res.json();
        isInitialized = data.initialized;
        if (data.authenticated && data.user) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err) {
      console.error("Failed to check admin status:", err);
    } finally {
      isCheckingStatus = false;
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    errorMessage = null;
    const cleanPasscode = passcode.trim();

    if (!cleanPasscode) {
      errorMessage = "Please enter your administrator passcode.";
      return;
    }

    if (!isInitialized) {
      if (cleanPasscode.length < 6) {
        errorMessage = "Master passcode must be at least 6 characters.";
        return;
      }
      if (cleanPasscode !== confirmPasscode.trim()) {
        errorMessage = "Passcodes do not match. Please re-enter.";
        return;
      }
    }

    isSubmitting = true;

    try {
      const endpoint = isInitialized ? "/api/admin/login" : "/api/admin/setup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), passcode: cleanPasscode })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      passcode = "";
      confirmPasscode = "";
      onLoginSuccess(data.user);
    } catch (err: unknown) {
      errorMessage = err instanceof Error ? err.message : "Authentication error.";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#0D0906] overflow-y-auto font-sans selection:bg-[#ff8c00]/30 selection:text-white">
  <!-- Glowing Amber/Orange Background Gradients -->
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-[#ff8c00]/15 rounded-full blur-[140px]"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff5500]/10 rounded-full blur-[160px]"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-[#ffa200]/15 rounded-full blur-[140px]"></div>
  </div>

  <!-- Subtle Animated Light Grid -->
  <div 
    class="absolute inset-0 opacity-[0.03] pointer-events-none"
    style="background-image: radial-gradient(#ff8c00 1px, transparent 1px); background-size: 32px 32px;"
  ></div>

  <!-- Center Authentication Card -->
  <div class="relative w-full max-w-md p-8 md:p-10 rounded-3xl bg-[#1A100A]/85 backdrop-blur-2xl border border-[#ff8c00]/25 shadow-2xl shadow-black/80 flex flex-col items-center">
    
    <!-- Top Back to Portfolio Link -->
    <button
      type="button"
      onclick={onBackToSite}
      class="absolute top-6 left-6 text-xs tracking-wider text-neutral-400 hover:text-[#ff8c00] transition-colors flex items-center gap-1.5 uppercase font-mono"
    >
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Website
    </button>

    <!-- Svelte Logo with Pulsing Orange Aura -->
    <div class="relative mb-6 mt-4 group">
      <div class="absolute -inset-2 bg-gradient-to-r from-[#ff8c00] to-[#ff4500] rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
      <div class="relative w-16 h-16 rounded-full bg-[#120905] border border-[#ff8c00]/40 flex items-center justify-center p-3 shadow-inner">
        <img src={svelteLogo} alt="Svelte Logo" class="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,140,0,0.8)]" />
      </div>
    </div>

    <!-- Title & Subtitle -->
    <h1 class="text-2xl font-black tracking-wider text-white text-center uppercase font-mono mb-1">
      PORTFOLIO ADMIN
    </h1>
    <p class="text-xs font-medium text-[#ffdb58]/80 tracking-widest uppercase mb-8 text-center">
      {isInitialized ? "Secure Administrator Access" : "Initialize Administrator Passcode"}
    </p>

    {#if errorMessage}
      <div class="w-full mb-6 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
        <svg class="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{errorMessage}</span>
      </div>
    {/if}

    <!-- Authentication Form -->
    <form onsubmit={handleSubmit} class="w-full flex flex-col gap-5">
      <div class="flex flex-col gap-2">
        <label for="admin-username" class="text-[11px] font-bold text-neutral-300 uppercase tracking-widest flex items-center justify-between font-mono">
          <span>USERNAME</span>
        </label>
        <div class="relative">
          <input
            id="admin-username"
            type="text"
            bind:value={username}
            disabled={isSubmitting || isCheckingStatus}
            placeholder="admin"
            autocomplete="username"
            class="w-full px-4 py-3.5 rounded-xl bg-[#0D0906]/90 border border-neutral-700/60 text-white placeholder-neutral-600 focus:outline-none focus:border-[#ff8c00] focus:ring-1 focus:ring-[#ff8c00] text-center font-mono text-lg transition-all"
          />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label for="admin-passcode" class="text-[11px] font-bold text-neutral-300 uppercase tracking-widest flex items-center justify-between font-mono">
          <span>ADMIN PASSCODE</span>
          <span class="text-neutral-500 text-[10px]">ARGON2ID</span>
        </label>
        <div class="relative">
          <input
            id="admin-passcode"
            type="password"
            bind:value={passcode}
            disabled={isSubmitting || isCheckingStatus}
            placeholder="••••••••••••"
            autocomplete="current-password"
            class="w-full px-4 py-3.5 rounded-xl bg-[#0D0906]/90 border border-neutral-700/60 text-white placeholder-neutral-600 focus:outline-none focus:border-[#ff8c00] focus:ring-1 focus:ring-[#ff8c00] text-center font-mono tracking-[0.3em] text-lg transition-all"
          />
        </div>
      </div>

      {#if !isInitialized}
        <div class="flex flex-col gap-2">
          <label for="confirm-passcode" class="text-[11px] font-bold text-neutral-300 uppercase tracking-widest font-mono">
            CONFIRM PASSCODE
          </label>
          <input
            id="confirm-passcode"
            type="password"
            bind:value={confirmPasscode}
            disabled={isSubmitting || isCheckingStatus}
            placeholder="••••••••••••"
            autocomplete="new-password"
            class="w-full px-4 py-3.5 rounded-xl bg-[#0D0906]/90 border border-neutral-700/60 text-white placeholder-neutral-600 focus:outline-none focus:border-[#ff8c00] focus:ring-1 focus:ring-[#ff8c00] text-center font-mono tracking-[0.3em] text-lg transition-all"
          />
        </div>
      {/if}

      <button
        type="submit"
        disabled={isSubmitting || isCheckingStatus}
        class="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-[#ff8c00] to-[#e65100] text-black font-extrabold uppercase tracking-widest text-sm shadow-lg shadow-orange-950/60 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono"
      >
        {#if isSubmitting}
          <span class="inline-flex items-center gap-2">
            <svg class="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            VERIFYING...
          </span>
        {:else if !isInitialized}
          INITIALIZE MASTER PASSCODE
        {:else}
          SIGN IN
        {/if}
      </button>
    </form>

    <!-- Footer Lock Badge -->
    <div class="mt-8 pt-6 border-t border-neutral-800/80 w-full flex items-center justify-center gap-2 text-[11px] text-neutral-400 font-mono tracking-wider">
      <svg class="w-3.5 h-3.5 text-[#ff8c00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      Authentication Protected
    </div>
  </div>
</div>

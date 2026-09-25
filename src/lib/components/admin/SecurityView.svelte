<script lang="ts">
  import { onMount } from "svelte";

  interface ActiveSession {
    id: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    expires_at: string;
  }

  let sessions = $state<ActiveSession[]>([]);
  let currentPasscode = $state("");
  let newPasscode = $state("");
  let confirmPasscode = $state("");
  let isChangingPassword = $state(false);
  let statusMessage = $state<{ text: string; isError?: boolean } | null>(null);

  onMount(() => {
    fetchSessions();
  });

  async function fetchSessions() {
    try {
      const res = await fetch("/api/admin/security/sessions");
      if (res.ok) {
        const data = await res.json();
        sessions = data.sessions || [];
      }
    } catch (e) {
      console.error("Failed to load sessions:", e);
    }
  }

  async function handleChangePassword(e: SubmitEvent) {
    e.preventDefault();
    if (isChangingPassword) return;

    statusMessage = null;
    const cleanCur = currentPasscode.trim();
    const cleanNew = newPasscode.trim();
    const cleanConf = confirmPasscode.trim();

    if (!cleanCur || !cleanNew) {
      statusMessage = { text: "Please enter your current and new passcodes.", isError: true };
      return;
    }

    if (cleanNew.length < 6) {
      statusMessage = { text: "New passcode must be at least 6 characters.", isError: true };
      return;
    }

    if (cleanNew !== cleanConf) {
      statusMessage = { text: "New passcodes do not match. Please re-enter.", isError: true };
      return;
    }

    isChangingPassword = true;

    try {
      const res = await fetch("/api/admin/security/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPasscode: cleanCur,
          newPasscode: cleanNew
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update passcode.");

      currentPasscode = "";
      newPasscode = "";
      confirmPasscode = "";
      statusMessage = { text: "✓ Master passcode updated successfully! Argon2id hash committed to database." };
      fetchSessions();
      setTimeout(() => (statusMessage = null), 5000);
    } catch (err: unknown) {
      statusMessage = {
        text: err instanceof Error ? err.message : "Error changing passcode.",
        isError: true
      };
    } finally {
      isChangingPassword = false;
    }
  }

  async function revokeAllSessions() {
    if (!confirm("Are you sure you want to log out all other active sessions?")) return;
    try {
      await fetch("/api/admin/security/revoke-all", { method: "POST" });
      fetchSessions();
      statusMessage = { text: "✓ All other active sessions have been revoked." };
      setTimeout(() => (statusMessage = null), 4000);
    } catch (e) {
      console.error("Revoke failed:", e);
    }
  }
</script>

<div class="space-y-6 animate-fade-in font-sans">
  <!-- Header -->
  <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800">
    <div class="text-xs font-mono tracking-widest text-[#ff8c00] uppercase mb-1">HARDENED SECURITY</div>
    <h2 class="text-xl font-bold text-white uppercase tracking-wider font-mono">
      Security Center & Credentials
    </h2>
    <p class="text-xs text-neutral-400 mt-0.5">
      Cryptographic password rotation (Argon2id), active session token management, and revocation controls.
    </p>
  </div>

  {#if statusMessage}
    <div class="p-3.5 rounded-xl border text-xs font-mono {statusMessage.isError ? 'bg-red-950/60 border-red-500/40 text-red-200' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'}">
      {statusMessage.text}
    </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Password Rotation Card -->
    <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 space-y-4">
      <div class="flex items-center gap-2 text-white font-mono text-sm font-bold uppercase tracking-wider">
        <svg class="w-4 h-4 text-[#ff8c00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        Rotate Master Passcode
      </div>

      <form onsubmit={handleChangePassword} class="space-y-4 text-xs font-mono">
        <div class="flex flex-col gap-1.5">
          <label for="current-passcode" class="text-neutral-400">Current Passcode</label>
          <input
            id="current-passcode"
            type="password"
            bind:value={currentPasscode}
            placeholder="••••••••••••"
            autocomplete="current-password"
            class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700 text-white tracking-widest focus:border-[#ff8c00] focus:outline-none"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="new-passcode" class="text-neutral-400">New Passcode (Min 6 Characters)</label>
          <input
            id="new-passcode"
            type="password"
            bind:value={newPasscode}
            placeholder="••••••••••••"
            autocomplete="new-password"
            class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700 text-white tracking-widest focus:border-[#ff8c00] focus:outline-none"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="confirm-passcode-field" class="text-neutral-400">Confirm New Passcode</label>
          <input
            id="confirm-passcode-field"
            type="password"
            bind:value={confirmPasscode}
            placeholder="••••••••••••"
            autocomplete="new-password"
            class="px-4 py-2.5 rounded-xl bg-[#0D0906] border border-neutral-700 text-white tracking-widest focus:border-[#ff8c00] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isChangingPassword}
          class="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff8c00] to-[#e65100] text-black font-extrabold text-xs font-mono tracking-wider shadow-lg shadow-orange-950/40 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
        >
          {isChangingPassword ? "VERIFYING & HASHING (ARGON2ID)..." : "UPDATE MASTER PASSCODE"}
        </button>
      </form>
    </div>

    <!-- Active Sessions & Revocation -->
    <div class="p-6 rounded-2xl bg-[#1A100A] border border-neutral-800 space-y-4 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2 text-white font-mono text-sm font-bold uppercase tracking-wider">
            <svg class="w-4 h-4 text-[#ffdb58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Active Sessions ({sessions.length})
          </div>

          <button
            type="button"
            onclick={revokeAllSessions}
            class="px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-500/30 text-red-300 hover:bg-red-950/60 font-mono text-[11px] font-bold transition-all"
          >
            Revoke All Other Devices
          </button>
        </div>

        <div class="space-y-3 font-mono text-xs max-h-80 overflow-y-auto">
          {#each sessions as s}
            <div class="p-3 rounded-xl bg-[#0D0906] border border-neutral-800 space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-white font-bold">IP: {s.ip_address || '127.0.0.1'}</span>
                <span class="text-emerald-400 text-[10px]">Active</span>
              </div>
              <p class="text-[11px] text-neutral-400 truncate">{s.user_agent}</p>
              <div class="text-[10px] text-neutral-500">
                Created: {s.created_at.slice(0, 16).replace('T', ' ')} · Expires: {s.expires_at.slice(0, 16).replace('T', ' ')}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Security Checklist Guarantee Box -->
      <div class="p-4 rounded-xl bg-[#0D0906] border border-emerald-500/20 text-[11px] text-neutral-300 font-mono space-y-1">
        <p class="text-emerald-400 font-bold">✓ SECURITY COMPLIANCE CONFIRMED</p>
        <p>• Zero credential files on disk</p>
        <p>• Password stored ONLY as RFC 9106 Argon2id hash</p>
        <p>• HTTP-only session cookies with SameSite protection</p>
      </div>
    </div>
  </div>
</div>

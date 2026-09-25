<script lang="ts">
  type Props = {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
  };

  let {
    isOpen,
    title,
    message,
    confirmText = "DELETE",
    cancelText = "CANCEL",
    onConfirm,
    onCancel
  }: Props = $props();
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
    <div 
      class="relative w-full max-w-md p-6 rounded-2xl bg-[#1A100A] border border-[#ff8c00]/30 shadow-2xl shadow-orange-950/50"
      role="dialog"
      aria-modal="true"
    >
      <!-- Orange Warning Glow Accent -->
      <div class="absolute -top-12 -right-12 w-32 h-32 bg-[#ff8c00]/10 rounded-full blur-2xl pointer-events-none"></div>

      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-white tracking-wide">{title}</h3>
      </div>

      <p class="text-sm text-neutral-300 mb-6 leading-relaxed">
        {message}
      </p>

      <div class="flex items-center justify-end gap-3">
        <button
          type="button"
          onclick={onCancel}
          class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onclick={onConfirm}
          class="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 active:scale-95 rounded-lg shadow-lg shadow-red-900/40 transition-all"
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fade-in {
    animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>

<script>
  import { toasts, removeToast } from '../../utils/toastStore.js';
  import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-svelte';
</script>

<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
  {#each $toasts as t (t.id)}
    <div
      class="pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5
        {t.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100' : ''}
        {t.type === 'error' ? 'bg-rose-950/90 border-rose-500/40 text-rose-100' : ''}
        {t.type === 'warning' ? 'bg-amber-950/90 border-amber-500/40 text-amber-100' : ''}
        {t.type === 'info' ? 'bg-slate-900/90 border-indigo-500/40 text-slate-100' : ''}
      "
    >
      <div class="flex items-center gap-3">
        {#if t.type === 'success'}
          <CheckCircle2 class="w-5 h-5 text-emerald-400 shrink-0" />
        {:else if t.type === 'error'}
          <AlertCircle class="w-5 h-5 text-rose-400 shrink-0" />
        {:else if t.type === 'warning'}
          <AlertTriangle class="w-5 h-5 text-amber-400 shrink-0" />
        {:else}
          <Info class="w-5 h-5 text-indigo-400 shrink-0" />
        {/if}
        <span class="text-sm font-medium leading-tight">{t.message}</span>
      </div>

      <button
        on:click={() => removeToast(t.id)}
        class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors ml-2"
        aria-label="Close notification"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  {/each}
</div>

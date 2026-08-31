<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { X } from 'lucide-svelte';

  export let title = '';
  export let isOpen = false;
  export let maxWidth = 'max-w-lg';

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && isOpen) {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      on:click={close}
      on:keydown={(e) => e.key === 'Escape' && close()}
      role="button"
      tabindex="-1"
      aria-label="Close modal overlay"
    ></div>

    <!-- Modal Container -->
    <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
      <div
        class="relative transform overflow-hidden rounded-2xl bg-slate-900 border border-slate-700/60 text-left shadow-2xl transition-all sm:my-8 w-full {maxWidth} p-6 glass-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <h3 class="text-xl font-bold text-white flex items-center gap-2" id="modal-headline">
            <slot name="header-icon" />
            {title}
          </h3>
          <button
            type="button"
            class="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            on:click={close}
            aria-label="Close modal"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="space-y-4">
          <slot />
        </div>

        <!-- Footer / Actions -->
        {#if $$slots.footer}
          <div class="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-3">
            <slot name="footer" />
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

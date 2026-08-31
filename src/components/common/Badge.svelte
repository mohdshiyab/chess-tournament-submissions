<script>
  export let variant = 'default'; // 'default', 'success', 'warning', 'danger', 'info', 'gold', 'silver', 'bronze'
  export let size = 'md'; // 'sm', 'md', 'lg'

  const variantClasses = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-700/50',
    danger: 'bg-rose-950/80 text-rose-300 border-rose-700/50',
    info: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50',
    gold: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    silver: 'bg-slate-400/20 text-slate-200 border-slate-400/50',
    bronze: 'bg-amber-700/20 text-amber-400 border-amber-700/50',
    gm: 'bg-purple-950/80 text-purple-300 border-purple-600/50 font-bold',
    im: 'bg-blue-950/80 text-blue-300 border-blue-600/50 font-semibold',
    fm: 'bg-teal-950/80 text-teal-300 border-teal-600/50'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };
</script>

<span
  class="inline-flex items-center gap-1.5 rounded-full font-medium border {variantClasses[variant] || variantClasses.default} {sizeClasses[size]}"
>
  <slot />
</span>

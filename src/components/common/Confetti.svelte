<script context="module">
  import confetti from 'canvas-confetti';

  export function triggerCelebration() {
    // Left side burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6, x: 0.2 },
      colors: ['#f59e0b', '#fbbf24', '#6366f1', '#10b981', '#ffffff']
    });

    // Right side burst
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6, x: 0.8 },
        colors: ['#f59e0b', '#fbbf24', '#6366f1', '#10b981', '#ffffff']
      });
    }, 200);

    // Center grand explosion
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5, x: 0.5 },
        colors: ['#f59e0b', '#ffd700', '#6366f1', '#ec4899', '#3b82f6']
      });
    }, 450);
  }
</script>

import { writable } from 'svelte/store';

export const toasts = writable([]);

let nextId = 1;

export function addToast({ message, type = 'info', duration = 3500 }) {
  const id = nextId++;
  const newToast = { id, message, type };

  toasts.update(all => [...all, newToast]);

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
}

export function removeToast(id) {
  toasts.update(all => all.filter(t => t.id !== id));
}

export const toast = {
  success: (msg, duration) => addToast({ message: msg, type: 'success', duration }),
  error: (msg, duration) => addToast({ message: msg, type: 'error', duration }),
  info: (msg, duration) => addToast({ message: msg, type: 'info', duration }),
  warning: (msg, duration) => addToast({ message: msg, type: 'warning', duration })
};

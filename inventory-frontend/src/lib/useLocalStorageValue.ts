'use client'

import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  return () => window.removeEventListener('storage', onChange)
}

/**
 * Reads a localStorage key as an external store, so it can be derived during
 * render instead of copied into state from an effect. Returns null on the
 * server, where localStorage does not exist.
 */
export function useLocalStorageValue(key: string) {
  return useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key),
    () => null
  )
}

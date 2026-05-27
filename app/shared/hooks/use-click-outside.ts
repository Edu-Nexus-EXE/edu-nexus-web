import { type RefObject, useEffect } from 'react'

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onClickOutside: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const element = ref.current

      if (!element || element.contains(event.target as Node)) {
        return
      }

      onClickOutside(event)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [onClickOutside, ref])
}

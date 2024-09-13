import { useEffect } from 'react'

interface KeyboardCallbacks {
  togglePlay: () => void
  playAudio: () => void
  previousWord: () => void
  nextWord: () => void // 添加这一行
}

export const useKeyboardShortcuts = (callbacks: KeyboardCallbacks) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        callbacks.togglePlay()
      } else if (e.code === 'ArrowLeft') {
        callbacks.previousWord()
      } else if (e.code === 'ArrowUp') {
        callbacks.playAudio()
      } 
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [callbacks])
}
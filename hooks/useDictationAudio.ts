import { useCallback, useRef, useEffect } from 'react'
import { Settings } from '@/types/wordDictation'

export const useDictationAudio = (settings: Settings) => {
  const utteranceRef = useRef<SpeechSynthesisUtterance>(new SpeechSynthesisUtterance())

  useEffect(() => {
    const utterance = utteranceRef.current
    utterance.lang = settings.pronunciation === "American" ? "en-US" : "en-GB"
    
    return () => {
      stopAudio()
    }
  }, [settings.pronunciation])

  const playAudio = useCallback((word: string) => {
    stopAudio() // 停止任何正在进行的播放
    
    const utterance = utteranceRef.current
    utterance.text = word
    
    speechSynthesis.speak(utterance)
  }, [])

  const stopAudio = useCallback(() => {
    speechSynthesis.cancel()
  }, [])

  return { playAudio, stopAudio, utteranceRef }
}
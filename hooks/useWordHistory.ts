import { useState, useCallback } from 'react'
import { WordHistory } from '@/types/wordDictation'

export const useWordHistory = () => {
  const [wordHistory, setWordHistory] = useState<WordHistory[]>([])

  const addWordToHistory = useCallback((word: WordHistory) => {
    setWordHistory(prev => [...prev, word])  // 新单词添加到数组的最后
  }, [])

  const removeLastWordFromHistory = useCallback(() => {
    setWordHistory(prev => prev.slice(0, -1))  // 删除数组的最后一个元素
  }, [])

  return { wordHistory, addWordToHistory, removeLastWordFromHistory }
}
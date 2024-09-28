import { useState, useEffect } from 'react'

interface WordProgress {
  correctWords: string[]
  incorrectWords: string[]
}

export function useWordProgress() {
  const [wordProgress, setWordProgress] = useState<WordProgress>(() => {
    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem('wordProgress')
      return savedProgress ? JSON.parse(savedProgress) : { correctWords: [], incorrectWords: [] }
    }
    return { correctWords: [], incorrectWords: [] }
  })

  useEffect(() => {
    localStorage.setItem('wordProgress', JSON.stringify(wordProgress))
  }, [wordProgress])

  const addWord = (word: string, isCorrect: boolean) => {
    setWordProgress(prev => {
      const newProgress = { ...prev }
      if (isCorrect) {
        newProgress.correctWords = Array.from(new Set([...prev.correctWords, word]))
        newProgress.incorrectWords = prev.incorrectWords.filter(w => w !== word)
      } else {
        newProgress.incorrectWords = Array.from(new Set([...prev.incorrectWords, word]))
      }
      return newProgress
    })
  }

  const removeIncorrectWord = (word: string) => {
    setWordProgress(prev => {
      return {
        correctWords: Array.from(new Set([...prev.correctWords, word])),
        incorrectWords: prev.incorrectWords.filter(w => w !== word)
      }
    })
  }

  const resetProgress = () => {
    setWordProgress({ correctWords: [], incorrectWords: [] })
  }

  return { wordProgress, addWord, resetProgress, removeIncorrectWord }
}
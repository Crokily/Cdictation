import { useState, useEffect, useCallback, useRef, useMemo, useReducer } from 'react'
import { Play, Pause, SkipBack, RefreshCw, Volume2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Settings, WordList, WordHistory } from '@/types/wordDictation'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useWordHistory } from '@/hooks/useWordHistory'
import { useDictationAudio } from '@/hooks/useDictationAudio'
import { useDictionary } from '@/hooks/useDictionary'
import { useWordProgress } from '@/hooks/useWordProgress'

interface DictationAreaProps {
  settings: Settings
  selectedWordList: WordList
}

type ContinuousPlay = 'on' | 'off'
type Mode = 'normal' | 'review'  // 新增：用于记录当前模式

export default function DictationArea({ settings, selectedWordList }: DictationAreaProps) {
  const [userInput, setUserInput] = useState("")
  const userInputRef = useRef("")  // 新增：用于存储最新的输入值
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [continuousPlay, setContinuousPlay] = useState<ContinuousPlay>('off')
  const remainingPlaysRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [mode, setMode] = useState<Mode>('normal')  // 新增：用于记录当前模式
  const [, forceUpdate] = useReducer(x => x + 1, 0)


  const { wordHistory, addWordToHistory, removeLastWordFromHistory } = useWordHistory()
  const { wordProgress, addWord, removeIncorrectWord } = useWordProgress()
  // const correctCount = wordProgress.correctWords.length
  // const incorrectCount = wordProgress.incorrectWords.length
  const [correctCount, setcorrectCount] = useState(0)
  const [incorrectCount, setincorrectCount] = useState(0)

  // 使用 useMemo 来计算 unheardWords，但根据模式更新
  const unheardWordsRef = useRef<string[]>([])

  useEffect(() => {
    if (mode === 'normal') {
      const heardWords = new Set([...wordProgress.correctWords, ...wordProgress.incorrectWords])
      unheardWordsRef.current = selectedWordList.words.filter(word => !heardWords.has(word))
    } else if (mode === 'review') {
      unheardWordsRef.current = wordProgress.incorrectWords
    }

    if (settings.isRandomOrder) {
      unheardWordsRef.current = shuffleArray(unheardWordsRef.current)
    }
  
    setCurrentWordIndex(0)
    stopAudio()
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setUserInput("")

    forceUpdate() // 强制重新渲染
  }, [mode])  // 根据模式和进度更新

  const currentWord = unheardWordsRef.current[currentWordIndex] || ""

  const { playAudio, stopAudio, utteranceRef } = useDictationAudio(settings)
  const { getTranslation, isLoading, error } = useDictionary()

  const translation = getTranslation(currentWord)

  const handleSpeechEnd = useCallback(() => {
    if (continuousPlay === 'on') {
      if (remainingPlaysRef.current > 0) {
        timeoutRef.current = setTimeout(() => {
          remainingPlaysRef.current--
          playAudio(currentWord)
        }, settings.interval * 1000)
      } else {
        // 当连续播放结束时，自动触发提交事件
        handleSubmit()
      }
    }
  }, [continuousPlay, currentWord, playAudio, settings.interval, userInput])

  useEffect(() => {
    const utterance = utteranceRef.current
    utterance.onend = handleSpeechEnd

    return () => {
      utterance.onend = null
    }
  }, [handleSpeechEnd, utteranceRef])

  useEffect(() => {
    if (continuousPlay === 'on') {
      remainingPlaysRef.current = settings.playCount - 1
      playAudio(currentWord)
    } else {
      stopAudio()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [continuousPlay, currentWord, playAudio, settings.playCount, stopAudio])

  const changeWord = (direction: 'next' | 'previous') => {
    stopAudio()
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (direction === 'next') {
      setCurrentWordIndex((prev) => Math.min(prev + 1, unheardWordsRef.current.length - 1))
    } else {
      const newIndex = Math.max(0, currentWordIndex - 1)
      setCurrentWordIndex(newIndex)
      if (newIndex !== currentWordIndex) {
        removeLastWordFromHistory()  // 只有在实际切换到上一个单词时才删除历史记录
      }
    }
    setUserInput("")
  }

  const { accuracyPercentage, accuracyColor } = useMemo(() => {
    const totalAnswers = correctCount + incorrectCount
    const percentage = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0
    let color = 'text-red-500'
    if (percentage >= 80) {
      color = 'text-green-500'
    } else if (percentage >= 60) {
      color = 'text-orange-500'
    }
    return { accuracyPercentage: percentage, accuracyColor: color }
  }, [correctCount, incorrectCount])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const errors = compareWords(currentWord, userInputRef.current)  // 使用 ref 值
    addWordToHistory({
      word: currentWord,
      translation: translation,
      errors: errors
    })

    if (errors.length === 0) {
      setcorrectCount(correctCount + 1)
    } else {
      setincorrectCount(incorrectCount + 1)
    }

    if (mode === 'normal') {
      // 更新单词进度
      addWord(currentWord, errors.length === 0)
    } else if (mode === 'review') {
      if (errors.length === 0) {
        // 在复习模式下，答对则从错词中移除
        removeIncorrectWord(currentWord)
      }
    }

    // 移动到下一个单词
    changeWord('next')

    // 重置连续播放状态
    setContinuousPlay('off')
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    // 如果还有下一个单词，开始新的连续播放
    if (currentWordIndex < unheardWordsRef.current.length - 1) {
      setContinuousPlay('on')
    }
  }

  const handleSinglePlay = (word: string) => {
    setContinuousPlay('off')
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    stopAudio()
    playAudio(word)
    // 重置剩余播放次数，确保单次播放不会触发自动提交
    remainingPlaysRef.current = settings.playCount
  }

  function shuffleArray(array: any[]) {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }
  


  const togglePlay = useCallback(() => {
    setContinuousPlay(prev => {
      if (prev === 'off') {
        remainingPlaysRef.current = settings.playCount - 1
        playAudio(currentWord)
        return 'on'
      } else {
        stopAudio()
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        return 'off'
      }
    })
  }, [currentWord, playAudio, settings.playCount, stopAudio])

  const compareWords = (correct: string, input: string): number[] => {
    const errors: number[] = []
    const trimmedCorrect = correct.trim().toLowerCase()
    const trimmedInput = input.trim().toLowerCase()
    
    for (let i = 0; i < trimmedCorrect.length; i++) {
      if (trimmedCorrect[i] !== trimmedInput[i]) {
        errors.push(i)
      }
    }
    return errors
  }

  useKeyboardShortcuts({
    togglePlay,
    playAudio: () => handleSinglePlay(currentWord),
    previousWord: () => changeWord('previous'),
    nextWord: () => changeWord('next'),
  })

  const PreviousWord = ({ word, translation, errors }: WordHistory) => (
    <div className="bg-gray-100 p-4 rounded-md hover:bg-gray-200 transition-colors cursor-pointer" onClick={() => handleSinglePlay(word)}>
      <div className="flex justify-between items-center">
        <p className="font-medium mb-2 text-gray-800">上一个单词:</p>
        <Button variant="ghost" size="icon" onClick={(e) => {
          e.stopPropagation()
          handleSinglePlay(word)
        }}>
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-2xl mb-1">
        {word.split('').map((char: string, index: number) => (
          <span key={index} className={errors.includes(index) ? 'text-red-500' : 'text-gray-700'}>
            {char}
          </span>
        ))}
      </p>
      <p className="text-gray-600">{translation}</p>
    </div>
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setUserInput(inputValue)
    userInputRef.current = inputValue  // 更新 ref 值

    // 检查输入是否与当前单词完全匹配
    if (inputValue.trim().toLowerCase() == currentWord.trim().toLowerCase()) {
      handleSubmit()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      {isLoading ? (
        <p>Loading dicatation...</p>
      ) : error ? (
        <p>Error：{error}</p>
      ) : (
        <>
          <div className="text-center mb-8">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Type the word here"
                className="flex-grow text-4xl font-bold text-gray-700 border-t-0 border-x-0 border-b-2 focus:ring-0 focus:border-gray-300 placeholder-gray-300 h-20 flex items-center justify-center text-center"
              />
            </form>
          </div>

          <div className="flex justify-center gap-4 mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => changeWord('previous')}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Return (←)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={togglePlay}>
                    {continuousPlay === 'on' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Play/Pause (Space)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => handleSinglePlay(currentWord)}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Replay (↑)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="mb-8 text-center">
            <p className="text-gray-600 mb-2">{currentWordIndex + 1}/{unheardWordsRef.current.length}</p>
            <Progress value={((currentWordIndex + 1) / unheardWordsRef.current.length) * 100} className="w-full" />
          </div>
          
          {wordHistory.length > 0 && (
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <div onClick={() => setIsDrawerOpen(true)}>
                  <PreviousWord {...wordHistory[wordHistory.length - 1]} />
                </div>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Dictated words</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col h-[calc(50vh-2rem)] overflow-hidden">
                  <div className="flex-grow overflow-y-auto">
                    <div className="flex flex-col-reverse p-4 space-y-4 space-y-reverse">
                      {wordHistory.map((word, index) => (
                        <div key={index} className="bg-gray-100 p-4 rounded-md hover:bg-gray-200 transition-colors cursor-pointer" onClick={() => handleSinglePlay(word.word)}>
                          <p className="text-2xl mb-1">
                            {word.word.split('').map((char: string, charIndex: number) => (
                              <span key={charIndex} className={word.errors.includes(charIndex) ? 'text-red-500' : 'text-gray-700'}>
                                {char}
                              </span>
                            ))}
                          </p>
                          <p className="text-gray-600">{word.translation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          )}

          <div className="relative pt-4">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className={`text-xs font-semibold inline-block py-1 uppercase rounded-full ${accuracyColor} bg-opacity-20`}>
                  Accuracy
                </span>
              </div>
              <div className="text-right">
                <span className={`text-xs font-semibold inline-block ${accuracyColor}`}>
                  {accuracyPercentage}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div style={{ width: `${accuracyPercentage}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500`}></div>
              <div style={{ width: `${100 - accuracyPercentage}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500`}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Correct: {correctCount}</span>
              <span>Incorrect: {incorrectCount}</span>
            </div>
          </div>

          {/* 新增：开始复习按钮 */}
          {wordProgress.incorrectWords.length > 0 && mode === 'normal' && (
            <div className="mt-4 text-center">
              <Button onClick={() => {
                setMode('review')
              }}>
                Review
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

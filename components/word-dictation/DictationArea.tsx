import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, SkipBack, RefreshCw, Volume2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Settings, WordList } from '@/types/wordDictation'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DictationAreaProps {
  settings: Settings
  selectedWordList: WordList
}

interface WordHistory {
  word: string
  translation: string
  errors: number[]
}

export default function DictationArea({ settings, selectedWordList }: DictationAreaProps) {
  const [userInput, setUserInput] = useState("")
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [wordHistory, setWordHistory] = useState<WordHistory[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const currentWord = selectedWordList.words[currentWordIndex] || ""

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors = compareWords(currentWord, userInput)
    const newWordHistory: WordHistory = {
      word: currentWord,
      translation: "翻译待添加", // 这里需要添加翻译功能
      errors: errors
    }
    setWordHistory([newWordHistory, ...wordHistory])
    setCurrentWordIndex((prev) => prev + 1)
    setUserInput("")
    // 删除了这里的自动播放下一个单词的代码
  }

  const playAudio = useCallback((word: string) => {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = settings.pronunciation === "American" ? "en-US" : "en-GB"
    speechSynthesis.speak(utterance)
  }, [settings.pronunciation])

  const startContinuousPlay = useCallback(() => {
    let count = 0
    const play = () => {
      if (count < settings.playCount) {
        playAudio(currentWord)
        count++
        setTimeout(play, settings.interval * 1000)
      } else {
        setIsPlaying(false)
      }
    }
    play()
  }, [currentWord, settings.playCount, settings.interval, playAudio])

  const togglePlay = () => {
    if (isPlaying) {
      speechSynthesis.cancel()
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
      startContinuousPlay()
    }
  }

  const compareWords = (correct: string, input: string): number[] => {
    const errors: number[] = []
    for (let i = 0; i < correct.length; i++) {
      if (correct[i] !== input[i]) {
        errors.push(i)
      }
    }
    return errors
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.code === 'ArrowLeft') {
        setCurrentWordIndex(i => Math.max(0, i - 1))
      } else if (e.code === 'ArrowUp') {
        playAudio(currentWord)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentWord, playAudio, togglePlay])

  const PreviousWord = ({ word, translation, errors, showLabel = true, onClick }: WordHistory & { showLabel?: boolean, onClick?: () => void }) => (
    <div className="bg-gray-100 p-4 rounded-md hover:bg-gray-200 transition-colors cursor-pointer" onClick={onClick}>
      {showLabel && (
        <div className="flex justify-between items-center">
          <p className="font-medium mb-2 text-gray-800">上一个单词:</p>
          <Button variant="ghost" size="icon" onClick={(e) => {
            e.stopPropagation()
            playAudio(word)
          }}>
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      <p className="text-2xl mb-1">
        {word.split('').map((char, index) => (
          <span key={index} className={errors.includes(index) ? 'text-red-500' : 'text-gray-700'}>
            {char}
          </span>
        ))}
      </p>
      <p className="text-gray-600">{translation}</p>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="输入单词"
            className="flex-grow text-4xl font-bold text-gray-700 border-t-0 border-x-0 border-b-2 focus:ring-0 focus:border-gray-300 placeholder-gray-300 h-20 flex items-center justify-center text-center"
          />
        </form>
      </div>

      <div className="flex justify-center gap-4 mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => setCurrentWordIndex(i => Math.max(0, i - 1))}>
                <SkipBack className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>返回 (←)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>播放/暂停 (空格)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => playAudio(currentWord)}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>重播 (↑)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="mb-8 text-center">
        <p className="text-gray-600 mb-2">{currentWordIndex + 1}/{selectedWordList.words.length}</p>
        <Progress value={((currentWordIndex + 1) / selectedWordList.words.length) * 100} className="w-full" />
      </div>

      {wordHistory.length > 0 && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <div onClick={() => setIsDrawerOpen(true)}>
              <PreviousWord {...wordHistory[0]} />
            </div>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>已听写的单词</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              {wordHistory.map((word, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-md hover:bg-gray-200 transition-colors cursor-pointer" onClick={() => playAudio(word.word)}>
                  <p className="text-2xl mb-1">
                    {word.word.split('').map((char, index) => (
                      <span key={index} className={word.errors.includes(index) ? 'text-red-500' : 'text-gray-700'}>
                        {char}
                      </span>
                    ))}
                  </p>
                  <p className="text-gray-600">{word.translation}</p>
                </div>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}
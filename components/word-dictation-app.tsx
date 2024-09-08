'use client'

import { useState } from 'react'
import { Play, SkipBack, Settings, User, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function WordDictationApp() {
  const [currentWord, setCurrentWord] = useState("")
  const [userInput, setUserInput] = useState("")
  const [progress, setProgress] = useState(1)
  const [timeRemaining, setTimeRemaining] = useState("10:00")
  const [previousWord, setPreviousWord] = useState({ 
    word: "cause", 
    translation: "原因；事由；理由", 
    errors: [2, 3] 
  })
  const [settings, setSettings] = useState({
    pronunciation: "American",
    playCount: 2,
    interval: 3,
    autoSubmit: false,
    wordList: "Basic"
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle word submission logic here
  }

  const playAudio = () => {
    // Play audio logic here
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">English Word Dictation</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <User className="h-6 w-6" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Settings</SheetTitle>
                  <SheetDescription>Customize your dictation experience</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pronunciation">Pronunciation</Label>
                    <select
                      id="pronunciation"
                      value={settings.pronunciation}
                      onChange={(e) => setSettings({...settings, pronunciation: e.target.value})}
                      className="border rounded p-1"
                    >
                      <option>American</option>
                      <option>British</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="playCount">Number of plays</Label>
                    <Input
                      id="playCount"
                      type="number"
                      value={settings.playCount}
                      onChange={(e) => setSettings({...settings, playCount: parseInt(e.target.value)})}
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="interval">Interval (seconds)</Label>
                    <Input
                      id="interval"
                      type="number"
                      value={settings.interval}
                      onChange={(e) => setSettings({...settings, interval: parseInt(e.target.value)})}
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoSubmit">Auto-submit</Label>
                    <Switch
                      id="autoSubmit"
                      checked={settings.autoSubmit}
                      onCheckedChange={(checked) => setSettings({...settings, autoSubmit: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="wordList">Word list</Label>
                    <select
                      id="wordList"
                      value={settings.wordList}
                      onChange={(e) => setSettings({...settings, wordList: e.target.value})}
                      className="border rounded p-1"
                    >
                      <option>Basic</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type the word here"
                className="flex-grow text-4xl font-bold text-gray-700 border-t-0 border-x-0 border-b-2 focus:ring-0 focus:border-gray-300 placeholder-gray-300 h-20 flex items-center justify-center text-center"
              />
            </form>
          </div>

          <div className="flex justify-center gap-4 mb-4">
            <Button variant="outline" size="icon" onClick={() => setProgress(p => Math.max(1, p - 1))}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={playAudio}>
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-8 text-center">
            <p className="text-gray-600 mb-2">{progress}/50</p>
            <Progress value={(progress / 50) * 100} className="w-full" />
            <p className="text-gray-600 mt-2">{timeRemaining} remaining</p>
          </div>

          {previousWord.word && (
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="font-medium mb-2 text-gray-800">Previous word:</p>
              <p className="text-2xl mb-1">
                {previousWord.word.split('').map((char, index) => (
                  <span key={index} className={previousWord.errors.includes(index) ? 'text-red-500' : 'text-gray-700'}>
                    {char}
                  </span>
                ))}
              </p>
              <p className="text-gray-600">{previousWord.translation}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
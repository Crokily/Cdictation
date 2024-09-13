import { Settings, WordList } from '@/types/wordDictation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Settings as SettingsIcon } from 'lucide-react'

interface SettingsSheetProps {
  settings: Settings
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
  wordLists: WordList[]
  selectedWordList: string
  setSelectedWordList: (id: string) => void
}

export default function SettingsSheet({
  settings,
  setSettings,
  wordLists,
  selectedWordList,
  setSelectedWordList
}: SettingsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <SettingsIcon className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>设置</SheetTitle>
          <SheetDescription>自定义您的听写体验</SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="pronunciation">发音</Label>
            <select
              id="pronunciation"
              value={settings.pronunciation}
              onChange={(e) => setSettings({...settings, pronunciation: e.target.value as "American" | "British"})}
              className="border rounded p-1"
            >
              <option value="American">美式</option>
              <option value="British">英式</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="playCount">播放次数</Label>
            <Input
              id="playCount"
              type="number"
              value={settings.playCount}
              onChange={(e) => setSettings({...settings, playCount: parseInt(e.target.value)})}
              className="w-20"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="interval">间隔（秒）</Label>
            <Input
              id="interval"
              type="number"
              value={settings.interval}
              onChange={(e) => setSettings({...settings, interval: parseInt(e.target.value)})}
              className="w-20"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="wordList">词库</Label>
            <select
              id="wordList"
              value={selectedWordList}
              onChange={(e) => setSelectedWordList(e.target.value)}
              className="border rounded p-1"
            >
              {wordLists.length === 0 ? (
                <option value="">无可用词库</option>
              ) : (
                wordLists.map((list) => (
                  <option key={list.id} value={list.id}>{list.name}</option>
                ))
              )}
            </select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
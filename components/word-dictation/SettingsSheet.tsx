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
import { useWordProgress } from '@/hooks/useWordProgress'

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
  const { resetProgress } = useWordProgress()

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to clear all progress? This operation is irreversible.')) {
      resetProgress()
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <SettingsIcon className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Setting</SheetTitle>
          <SheetDescription>Customize your dictation experience</SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="pronunciation">Pronunciation</Label>
            <select
              id="pronunciation"
              value={settings.pronunciation}
              onChange={(e) => setSettings({...settings, pronunciation: e.target.value as "American" | "British"})}
              className="border rounded p-1"
            >
              <option value="American">American</option>
              <option value="British">British</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="playCount">Play Count</Label>
            <Input
              id="playCount"
              type="number"
              value={settings.playCount}
              onChange={(e) => setSettings({...settings, playCount: parseInt(e.target.value)})}
              className="w-20"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="interval">Interval (S)</Label>
            <Input
              id="interval"
              type="number"
              value={settings.interval}
              onChange={(e) => setSettings({...settings, interval: parseInt(e.target.value)})}
              className="w-20"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="wordList">Word List</Label>
            <select
              id="wordList"
              value={selectedWordList}
              onChange={(e) => setSelectedWordList(e.target.value)}
              className="border rounded p-1"
            >
              {wordLists.length === 0 ? (
                <option value="">None</option>
              ) : (
                wordLists.map((list) => (
                  <option key={list.id} value={list.id}>{list.name}</option>
                ))
              )}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="randomOrder">Random order</Label>
            <Switch
              id="randomOrder"
              checked={settings.isRandomOrder}
              onCheckedChange={(checked) => setSettings({...settings, isRandomOrder: checked})}
            />
          </div>
          <div className="pt-4">
            <Button onClick={handleResetProgress} variant="destructive">
              Clear all progress
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
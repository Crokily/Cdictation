import { User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import ImportDialog from './ImportDialog'
import SettingsSheet from './SettingsSheet'
import { WordList, Settings as SettingsType } from '@/types/wordDictation'

interface HeaderProps {
  settings: SettingsType;
  setSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
  wordLists: WordList[];
  selectedWordList: string;
  setSelectedWordList: (id: string) => void;
  onImport: (wordList: WordList) => void;
}

export default function Header({
  settings,
  setSettings,
  wordLists,
  selectedWordList,
  setSelectedWordList,
  onImport
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Word Dictation</h1>
        <div className="flex items-center gap-2">
          <ImportDialog onImport={onImport} />
          <SettingsSheet
            settings={settings}
            setSettings={setSettings}
            wordLists={wordLists}
            selectedWordList={selectedWordList}
            setSelectedWordList={setSelectedWordList}
          />
          <Button variant="ghost" size="icon">
            <User className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}
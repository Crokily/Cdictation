import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload } from 'lucide-react'
import { WordList } from '@/types/wordDictation'

interface ImportDialogProps {
  onImport: (wordList: WordList) => void
}

export default function ImportDialog({ onImport }: ImportDialogProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [wordListName, setWordListName] = useState("")
  const [uploadedWords, setUploadedWords] = useState<string[]>([])
  const { toast } = useToast()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const words = content
          .split(/[\n\r]+/)
          .map(word => word.trim())
          .filter(word => word !== '')
        setUploadedWords(words)
      }
      reader.readAsText(file)
    }
  }

  const handleImport = () => {
    if (!wordListName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the word list.",
        variant: "destructive",
      })
      return
    }

    const newWordList: WordList = {
      id: Date.now().toString(),
      name: wordListName,
      words: uploadedWords,
    }

    onImport(newWordList)
    setImportDialogOpen(false)
    setWordListName("")
    setUploadedWords([])
  }

  return (
    <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Upload className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Word List</DialogTitle>
          <DialogDescription>
            Upload a .txt or .csv file containing your word list.
            <br />
            One word per line, no definitions
            <br />
            word list sharing: <a href="https://t.ly/bpOD0" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">https://t.ly/bpOD0</a>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="List Name"
            value={wordListName}
            onChange={(e) => setWordListName(e.target.value)}
          />
          <Input
            type="file"
            accept=".txt,.csv"
            onChange={handleFileUpload}
            className="cursor-pointer"
          />
          {uploadedWords.length > 0 && (
            <>
              <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                {uploadedWords.map((word, index) => (
                  <div key={index} className="py-1">{word}</div>
                ))}
              </ScrollArea>
              <p className="text-sm text-gray-500">
                {uploadedWords.length} words will be imported.
              </p>
              <Button onClick={handleImport} className="w-full">
                Import Words
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
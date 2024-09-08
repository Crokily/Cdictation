export interface WordList {
  id: string;
  name: string;
  words: string[];
}

export interface Settings {
  pronunciation: "American" | "British";
  playCount: number;
  interval: number;
  autoSubmit: boolean;
  wordList: string;
}
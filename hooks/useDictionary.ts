import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

interface DictionaryEntry {
  word: string;
  translation: string;
}

export function useDictionary() {
  const [dictionary, setDictionary] = useState<Map<string, DictionaryEntry>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const response = await fetch('https://file.coly.cc/EnWords.csv');
        // const response = await fetch('/data/EnWords.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const dict = new Map<string, DictionaryEntry>();
            results.data.forEach((entry: any) => {
              if (entry.word && entry.translation) {
                dict.set(entry.word.toLowerCase().trim(), {
                  word: entry.word.trim(),
                  translation: entry.translation.trim()
                });
              }
            });
            setDictionary(dict);
            console.log('Dictionary loaded:', dict);
            setIsLoading(false);
          },
          error: () => {
            console.error('CSV parsing error:', error);
            setError('词典加载失败');
            setIsLoading(false);
          }
        });
      } catch (err) {
        console.error('Dictionary loading error:', err);
        setError('词典加载失败');
        setIsLoading(false);
      }
    };

    loadDictionary();
  }, []);

  const getTranslation = useCallback((word: string): string => {
    const lowercaseWord = word.toLowerCase().trim();
    console.log('Looking up word:', lowercaseWord);
    const entry = dictionary.get(lowercaseWord);
    console.log('Found entry:', entry);
    return entry ? entry.translation : '未找到翻译';
  }, [dictionary]);

  return { getTranslation, isLoading, error };
}
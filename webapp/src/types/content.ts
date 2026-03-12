export interface AlphabetLetter {
  upper: string;
  lower: string;
  name: string;
  sound_ru: string;
  note?: string;
  example?: string;
}

export interface AlphabetContent {
  title: string;
  letters: AlphabetLetter[];
}

export interface DiphthongExample {
  word: string;
  ru: string;
}

export interface DiphthongItem {
  diphthong: string;
  sound_ru: string;
  examples: DiphthongExample[];
}

export interface DiphthongsContent {
  title: string;
  items: DiphthongItem[];
}

export type TheoryContent = AlphabetContent | DiphthongsContent;

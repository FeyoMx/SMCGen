
export interface SocialMediaContent {
  description: string;
  dialogues: string[];
  hashtags: string[];
}

export interface SocialMediaContentWithGrounding {
  text: string;
  groundingUrls: string[];
}

export enum FileType {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Text = 'text',
}
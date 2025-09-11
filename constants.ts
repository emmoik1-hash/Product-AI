
import { ContentType } from "./types";

export const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'creative', label: 'Creative' },
  { value: 'premium', label: 'Premium / Luxury' },
  { value: 'witty', label: 'Witty / Humorous' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'technical', label: 'Technical / Informative' },
  { value: 'playful', label: 'Playful' },
  { value: 'formal', label: 'Formal' },
  { value: 'empathetic', label: 'Empathetic' },
];

export const LANGUAGES = [
  { value: 'en', label: 'English (EN)' },
  { value: 'vi', label: 'Vietnamese (VI)' },
  { value: 'es', label: 'Spanish (ES)' },
  { value: 'jp', label: 'Japanese (JP)' },
  { value: 'de', label: 'German (DE)' },
];

export const CONTENT_TYPES: {value: ContentType, label: string}[] = [
    { value: 'product_description', label: 'Product Description' },
    { value: 'social_media_post', label: 'Social Media Post' },
];
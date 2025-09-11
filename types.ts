
export type ContentType = 'product_description' | 'social_media_post';

export interface ProductInfo {
  productName: string;
  description: string;
  tone: string;
  language: string;
  contentType: ContentType;
  imageData?: string; // base64 encoded image
  imageMimeType?: string;
}

export interface SeoData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface GenerateApiResponse {
  // Fields for Product Description
  descriptions?: string[];
  seo?: SeoData;
  featureBullets?: string[];
  targetAudience?: string;
  callToActions?: string[];
  hashtags?: string[];
  // Fields for Social Media Post
  socialMediaPosts?: string[];
}

// For Bulk Upload
export interface BulkProductInfo {
  product_name: string;
  description: string;
}

export interface BulkResult extends BulkProductInfo {
  generated_description_1?: string;
  generated_description_2?: string;
  generated_description_3?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  error?: string;
}

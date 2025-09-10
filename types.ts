export interface ProductInfo {
  productName: string;
  description: string;
  tone: string;
  language: string;
}

export interface SeoData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface GenerateApiResponse {
  descriptions: string[];
  seo: SeoData;
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
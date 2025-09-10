import Papa from 'papaparse';
import type { BulkProductInfo, BulkResult } from '../types';

export function parseCSV(csvText: string): Promise<BulkProductInfo[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<BulkProductInfo>(csvText.trim(), {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          // Ghi lại lỗi nhưng không nhất thiết phải dừng toàn bộ quá trình
          console.error('CSV Parsing Errors:', results.errors);
        }

        if (!results.meta.fields || !results.meta.fields.includes('product_name') || !results.meta.fields.includes('description')) {
          return reject(new Error('CSV must contain "product_name" and "description" columns.'));
        }
        
        const validProducts = results.data.filter(p => p.product_name && p.product_name.trim() !== '');
        resolve(validProducts);
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}

export function generateCSV(data: BulkResult[]): string {
  if (data.length === 0) return '';
  // Sử dụng Papa.unparse để tạo CSV một cách đáng tin cậy hơn so với việc nối chuỗi thủ công.
  return Papa.unparse(data, {
    columns: [
      'product_name',
      'description',
      'generated_description_1',
      'generated_description_2',
      'generated_description_3',
      'meta_title',
      'meta_description',
      'keywords',
      'error',
    ],
  });
}
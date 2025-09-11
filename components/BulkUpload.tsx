
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { generateContent } from '../services/geminiService';
import { parseCSV, generateCSV } from '../utils/csv';
import type { BulkProductInfo, BulkResult, ProductInfo } from '../types';
import { TONES } from '../constants';
import { UploadIcon } from './icons/UploadIcon';
import { FileSpreadsheetIcon } from './icons/FileSpreadsheetIcon';


interface BulkUploadProps {
  isLimitReached: boolean;
}

const parseExcel = (file: File): Promise<BulkProductInfo[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json<BulkProductInfo>(worksheet);

                if (json.length > 0) {
                    const firstRow = json[0];
                    if (typeof firstRow.product_name === 'undefined' || typeof firstRow.description === 'undefined') {
                        return reject(new Error('Excel file must contain "product_name" and "description" columns.'));
                    }
                }
                
                const validProducts = json.filter(p => p.product_name && String(p.product_name).trim() !== '');

                resolve(validProducts);
            } catch (err) {
                reject(err instanceof Error ? err : new Error('Failed to parse Excel file.'));
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};

export const BulkUpload: React.FC<BulkUploadProps> = ({ isLimitReached }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<BulkResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<string>('');
  
  const [tone, setTone] = useState<string>(TONES[0].value);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const fileName = files[0].name.toLowerCase();
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx')) {
        setError("Invalid file type. Please upload a CSV or XLSX file.");
        setFile(null);
        return;
      }
      setFile(files[0]);
      setError(null);
    }
  };
  
  const resetState = () => {
    setFile(null);
    setIsProcessing(false);
    setProgress({ current: 0, total: 0 });
    setResults([]);
    setError(null);
    setCurrentProduct('');
  };

  const handleProcess = async () => {
    if (isLimitReached) {
        setError("You have reached your free usage limit. Please register to continue.");
        return;
    }
    if (!file) {
      setError("Please select a file to process.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults([]);

    try {
        let products: BulkProductInfo[];
        const fileName = file.name.toLowerCase();
        
        if (fileName.endsWith('.csv')) {
            const text = await file.text();
            products = await parseCSV(text);
        } else if (fileName.endsWith('.xlsx')) {
            products = await parseExcel(file);
        } else {
            throw new Error("Unsupported file type.");
        }

        if (products.length === 0) {
          setError("File is empty or invalid. Make sure it contains \"product_name\" and \"description\" columns.");
          setIsProcessing(false);
          return;
        }

        setProgress({ current: 0, total: products.length });

        const newResults: BulkResult[] = [];
        for (let i = 0; i < products.length; i++) {
          const product = products[i];
          setCurrentProduct(product.product_name);
          setProgress({ current: i + 1, total: products.length });

          const productInfo: ProductInfo = {
            productName: product.product_name,
            description: product.description,
            tone,
            language: 'en', // Default to English for all bulk items
            contentType: 'product_description', // Bulk only supports product descriptions for now
          };
          
          try {
            const apiResponse = await generateContent(productInfo);
            const result: BulkResult = {
              ...product,
              generated_description_1: apiResponse.descriptions?.[0] || '',
              generated_description_2: apiResponse.descriptions?.[1] || '',
              generated_description_3: apiResponse.descriptions?.[2] || '',
              meta_title: apiResponse.seo?.metaTitle,
              meta_description: apiResponse.seo?.metaDescription,
              keywords: apiResponse.seo?.keywords.join(', '),
            };
            newResults.push(result);
          } catch (err) {
            const errorResult: BulkResult = {
              ...product,
              error: err instanceof Error ? err.message : 'Unknown API error',
            };
            newResults.push(errorResult);
          }
        }
        setResults(newResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse or process file.');
        console.error(err);
      } finally {
        setIsProcessing(false);
        setCurrentProduct('');
      }
  };
  
  const handleDownloadTemplate = () => {
      const csvContent = "product_name,description\nSmart Thermos Bottle,\"Keeps drinks hot for 12 hours, LED temperature display, 500ml capacity\"\n";
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "template.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  const handleDownloadCSV = () => {
    const csvString = generateCSV(results);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'generated_products.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadExcel = () => {
    const dataForSheet = results.map(row => ({
      'product_name': row.product_name,
      'description': row.description,
      'generated_description_1': row.generated_description_1,
      'generated_description_2': row.generated_description_2,
      'generated_description_3': row.generated_description_3,
      'meta_title': row.meta_title,
      'meta_description': row.meta_description,
      'keywords': row.keywords,
      'error': row.error,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(workbook, "generated_products.xlsx");
  };
  
  if (isProcessing) {
      return (
        <div className="bg-neutral-800 p-8 rounded-xl shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Processing in Progress...</h2>
            <p className="text-gray-400 mb-2">{`Generating content for: ${currentProduct}`}</p>
            <div className="w-full bg-neutral-700 rounded-full h-4 mb-4 overflow-hidden">
                <div 
                    className="bg-primary h-4 rounded-full transition-all duration-300" 
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
            </div>
            <p className="text-lg font-mono">{progress.current} / {progress.total}</p>
        </div>
      )
  }
  
  if (results.length > 0) {
      const successes = results.filter(r => !r.error);
      const failures = results.filter(r => r.error);
      return (
        <div className="bg-neutral-800 p-8 rounded-xl shadow-lg text-center max-w-3xl mx-auto">
             <h2 className="text-2xl font-bold mb-2">Processing Complete!</h2>
             <p className="text-gray-300 mb-6">{`Successfully generated descriptions for ${successes.length} of ${results.length} products.`}</p>
             <div className="flex flex-wrap justify-center gap-4">
                <button
                    onClick={handleDownloadCSV}
                    className="flex items-center justify-center space-x-2 bg-neutral-600 hover:bg-neutral-500 text-white font-bold py-3 px-6 rounded-md transition-all duration-300"
                >
                    <FileSpreadsheetIcon />
                    <span>Download CSV</span>
                </button>
                <button
                    onClick={handleDownloadExcel}
                    className="flex items-center justify-center space-x-2 bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-md transition-all duration-300"
                >
                    <FileSpreadsheetIcon />
                    <span>Download Excel (.xlsx)</span>
                </button>
                 <button
                    onClick={resetState}
                    className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-md transition-all duration-300"
                >
                    Start Over
                </button>
             </div>
             
            {failures.length > 0 && (
                <div className="mt-8 text-left bg-neutral-900/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-400 mb-3">{`Failed Products (${failures.length}):`}</h3>
                    <ul className="space-y-2 max-h-48 overflow-y-auto text-sm">
                        {failures.map((fail, index) => (
                            <li key={index} className="p-2 bg-neutral-700/50 rounded">
                                <p className="font-semibold text-white">{fail.product_name}</p>
                                <p className="text-red-400/80 italic text-xs">{fail.error}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      )
  }

  return (
    <div className="bg-neutral-800 p-6 md:p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-2">Bulk Generate Descriptions</h2>
      <p className="text-gray-400 mb-6">Upload a CSV or XLSX file with `product_name` and `description` columns to generate content for multiple products at once.</p>
      
       <div className="mb-6">
          <label htmlFor="tone-bulk" className="block text-sm font-medium text-gray-300 mb-2">
            Tone of Voice (for all products)
          </label>
          <select
            id="tone-bulk"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full bg-neutral-700 border border-neutral-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary"
          >
            {TONES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      
      <div className="border-2 border-dashed border-neutral-600 rounded-lg p-8 text-center">
        <UploadIcon />
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="mt-4 font-semibold text-primary hover:text-primary-hover cursor-pointer">
          {file ? `${file.name}` : "Click to upload or drag and drop"}
        </label>
        <p className="text-xs text-gray-500 mt-1">CSV or XLSX file up to 10MB</p>
      </div>

       <div className="mt-4 text-center">
          <button onClick={handleDownloadTemplate} className="text-sm text-gray-400 hover:text-white inline-flex items-center space-x-2">
            <FileSpreadsheetIcon />
            <span>Download CSV Template</span>
          </button>
       </div>
      
      {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
      
      {isLimitReached && (
        <div className="text-center mt-4 p-3 bg-amber-900/50 border border-amber-600 text-amber-300 rounded-md text-sm">
          You have reached your free usage limit. Please register to continue.
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={handleProcess}
          disabled={!file || isProcessing || isLimitReached}
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-md transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          Process File
        </button>
      </div>
    </div>
  );
};
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import type { ReceiptData } from '../types/receipt';

const receiptSchema = z.object({
  date: z.string().describe('The date of the receipt in YYYY-MM-DD format'),
  merchant: z.string().describe('The name of the merchant/store'),
  description: z.string().max(50).describe('A brief description of items purchased (5 words or less)'),
  total: z.number().describe('The total amount including taxes. Positive for purchases, negative for returns'),
});

export async function processReceipt(file: File): Promise<ReceiptData> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set in environment variables');
  }

  // Convert file to base64 data URL
  const base64 = await fileToBase64(file);

  // Create model instance - API key should be set via GOOGLE_GENERATIVE_AI_API_KEY env var
  // For Vite, we need to map VITE_GEMINI_API_KEY to the expected variable
  // Note: The provider may need GOOGLE_GENERATIVE_AI_API_KEY, but in browser we use VITE_ prefix
  const model = google('gemini-2.5-flash');

  const { object } = await generateObject({
    model,
    schema: receiptSchema,
    messages: [
      {
        role: 'user' as const,
        content: [
          {
            type: 'text' as const,
            text: `Extract receipt information from this ${file.type?.includes('pdf') ? 'PDF' : 'image'}. 
    
    Return the following information:
    - date: The date of the receipt in YYYY-MM-DD format
    - merchant: The name of the merchant/store
    - description: A brief description of the items purchased (5 words or less)
    - total: The total amount including taxes. Use positive numbers for purchases and negative numbers for returns/refunds
    
    Analyze the receipt carefully and extract accurate information.`,
          },
          {
            type: 'image' as const,
            image: base64,
          },
        ],
      },
    ],
  });

  return object as ReceiptData;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


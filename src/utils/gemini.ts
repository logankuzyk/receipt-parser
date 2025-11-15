import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import type { ReceiptData } from '../types/receipt';

const receiptSchema = z.object({
  date: z.string().describe('The date of the receipt in YYYY-MM-DD format'),
  merchant: z.string().describe('The name of the merchant/store'),
  description: z.string().max(50).describe('A brief description of items purchased (5 words or less)'),
  total: z.number().describe('The total amount including taxes. Positive for purchases, negative for returns'),
});

export async function processReceipt(file: File, apiKey: string): Promise<ReceiptData> {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  // Convert file to base64 data URL
  const base64 = await fileToBase64(file);

  // Create provider instance with API key
  const googleProvider = createGoogleGenerativeAI({
    apiKey: apiKey,
  });

  // Create model instance
  const model = googleProvider('gemini-2.5-flash');

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


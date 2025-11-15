# Receipt Parser

A modern web application built with React and TypeScript that extracts structured data from receipt images and PDFs using Google Gemini AI. Upload multiple receipts, track their processing status, and export the extracted data in TSV or CSV format.

## Features

- **Multi-file Upload**: Upload multiple PDF or image files (PDF, JPG, JPEG, PNG) simultaneously
- **Status Tracking**: Real-time status updates for each file (queued, processing, processed, error)
- **AI-Powered Extraction**: Uses Google Gemini 2.5 Flash to extract structured receipt data:
  - Date (YYYY-MM-DD format)
  - Merchant name
  - Item description (5 words or less)
  - Total amount (positive for purchases, negative for returns)
- **Data Export**: 
  - Copy table data as TSV (Tab-Separated Values) to clipboard
  - Download data as CSV file
- **User-Friendly Interface**: Clean, modern UI with visual status indicators

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key ([Get one here](https://ai.google.dev/))

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd receipt-parser
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

3. Enter your Google Gemini API key in the input field at the top of the page

4. Click "Select PDFs or Images" and select one or more receipt files

5. Wait for processing to complete. Files will be processed sequentially, and you'll see status updates in real-time

6. View the extracted data in the table below

7. Use the "Copy TSV" button to copy the data to your clipboard, or "Download CSV" to save it as a file

## API Key Setup

The application requires a Google Gemini API key to function. You can obtain one from the [Google AI Studio](https://ai.google.dev/).

**Important**: The API key is entered directly in the browser and is not stored or transmitted anywhere except to Google's API for processing receipts. For production use, consider implementing a backend proxy to keep API keys secure.

## Project Structure

```
receipt-parser/
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx      # Multi-file upload component
│   │   ├── FileList.tsx         # File list with status badges
│   │   └── ReceiptTable.tsx     # Table displaying extracted data
│   ├── types/
│   │   └── receipt.ts           # TypeScript type definitions
│   ├── utils/
│   │   ├── gemini.ts            # Google Gemini API integration
│   │   └── export.ts            # TSV/CSV export utilities
│   ├── App.tsx                  # Main application component
│   ├── App.css                  # Application styles
│   └── main.tsx                 # Application entry point
├── package.json
└── vite.config.ts
```

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Vercel AI SDK** - AI integration framework
- **Google Gemini AI** - Receipt data extraction
- **Zod** - Schema validation for structured output

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Building for Production

```bash
npm run build
```

The production build will be output to the `dist/` directory, ready to be deployed to any static hosting service.

## License

Private project

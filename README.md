# InstaBudget

A smart budgeting application that helps users track expenses using AI-powered receipt scanning and voice recording.

**Team Members:** Joshua Yi, Ej Matugas, Giap Do, Eric Wang

## Overview

InstaBudget is a web application that simplifies expense tracking by allowing users to:

- **Scan receipts** using AI to automatically extract transaction details
- **Record voice transactions** by speaking about purchases
- **Manually enter transactions**
- **Set up budgets** with categories and spending limits
- **View spending insights** and track progress toward budget goals

## Key Features

### Receipt Scanning

Upload a photo of a receipt and the AI automatically extracts:

- Merchant name
- Items purchased
- Total amount
- Transaction date
- Category

### Voice Recording

Speak about your purchase and the AI processes the audio to create a transaction entry.

### Budget Management

- Set monthly budget cycles
- Create spending categories with limits
- Track spending progress with visual indicators
- Receive alerts when approaching or exceeding limits

### Dashboard

View an overview of:

- Total spending vs. budget
- Budget category breakdowns
- Transaction history
- AI-generated spending insights

## Technology Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (database & authentication)
- **AI/ML:** Google Gemini API for receipt scanning and voice processing
- **UI Components:** Radix UI, shadcn/ui

## Project Structure

```
instab/
├── app/                    # Next.js app router pages
│   ├── (app)/             # Protected app routes
│   │   ├── dashboard/     # Main dashboard page
│   │   ├── scan/          # Receipt scanning & voice recording
│   │   ├── transactions/  # Transaction list & management
│   │   ├── budget/        # Budget configuration
│   │   ├── receipts/      # Receipt gallery
│   │   └── profile/       # User profile settings
│   └── auth/              # Authentication pages
├── components/             # Reusable React components
├── lib/                    # Utilities and providers
│   ├── date-utils.ts      # Date handling utilities
│   ├── auth-provider.tsx  # Authentication context
│   └── user-data-provider.tsx  # User data context
└── supabase-backend-edge-fn/  # Supabase edge functions
    ├── LLM_receipt.ts     # Receipt scanning function
    └── ai_audio_scan.ts   # Voice processing function
```

## Main Pages

- **Dashboard** (`/dashboard`) - Overview of spending and budget progress
- **Scan** (`/scan`) - Add transactions via receipt scan, voice, or manual entry
- **Transactions** (`/transactions`) - View and edit all transactions
- **Budget** (`/budget`) - Configure budget cycles and category limits
- **Receipts** (`/receipts`) - Gallery of scanned receipts
- **Profile** (`/profile`) - User account settings and preferences

## Notes

- The application uses local timezone for all dates to ensure accurate date display
- Transactions can be automatically saved or reviewed before saving
- Budget categories support custom spending limits
- All data is stored securely in Supabase

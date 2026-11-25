# EnovAcc

EnovAcc is a finance workspace built with React and Vite. It includes dashboard reporting, accounting modules, authentication flows, workspace management, and Supabase-backed profile data.

## Features

- Dashboard with cash position, month close, and approval summaries
- Chart of accounts and general ledger
- Journal entries and financial reports
- Invoices, payables, expenses, and bank reconciliation
- Tax summaries and integration status
- Audit trail and workspace user management
- Account settings and password management
- Password and OTP-based authentication through Supabase

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project

## Environment setup

Create a local environment file with:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The application reads these variables from `src/lib/supabase.js`.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Vite prints the local development URL in the terminal.

## Quality and build commands

```bash
npm run lint
npm run build
npm run preview
```

## Project structure

- `src/App.jsx` - application routing and authentication state
- `src/components/` - workspace, navigation, reporting, and authentication components
- `src/lib/supabase.js` - Supabase client configuration
- `src/assets/` - application images
- `public/` - static public assets

# Freelance Invoicer & Contract Generator

A web application designed specifically for Indonesian freelancers to manage their legal and financial documents (Invoices, Quotations, and Contracts) seamlessly. The app supports dual currency (IDR & USD) and generates professional, print-ready PDF documents directly in the browser.

## Features

### Guest Mode (No Login Required)
Create documents instantly with client-side PDF generation (`@react-pdf/renderer`), ensuring your data never leaves your browser.
- **Invoice Generator**: Create professional invoices with automatic total calculations. Includes warning for Indonesian Stamp Duty (Bea Meterai) for transactions above Rp5.000.000.
- **Quotation Generator**: Send formal cost estimates with validity periods to prospective clients.
- **Contract Generator**: Draft professional service agreements (SPK) with standard or custom clauses and signature blocks.
- **Bilingual Support**: All generated PDF documents can be switched between **Indonesian** and **English** languages on the fly!

### Premium UI/UX
- Built with **Next.js 15+** and **Tailwind CSS v4**.
- Uses elegant glassmorphism and modern design principles.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Tech Stack
- Next.js (App Router)
- React 19
- Tailwind CSS v4
- @react-pdf/renderer
- Drizzle ORM (Database Schema ready for Multi-tenant)
- Vercel Postgres

## Upcoming Features (Roadmap)
- **Login Mode / Multi-Tenant**: Save and manage client profiles, document history, and default settings via NextAuth.
- **Dashboard Analytics**: Track Draft, Sent, Paid, and Overdue documents.



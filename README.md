# LRS Motors Telegram Mini App

A professional dealership management system for LRS Motors built with Next.js 15, TypeScript, and Tailwind CSS.

## Features
- Dashboard with key metrics and KPIs
- Inventory management with vehicle details
- Mobile-first responsive design
- Telegram Mini App integration (ready)
- Supabase authentication and database integration
- Role-based access control (Director, CEO)
- Professional UI with Tailwind CSS

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database/Auth**: Supabase
- **Icons**: Lucide React
- **Hosting**: Vercel

## Deployment
The repository is connected to Vercel for Git-based deployments. Production environment variables should be configured in Vercel rather than committed to Git.

Required public Supabase variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Never commit private/service-role keys.

# LRS Motors Telegram Mini App

A professional dealership management system for LRS Motors built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

### Current Implementation
- ✅ Dashboard with key metrics and KPIs
- ✅ Inventory management with vehicle details
- ✅ Mobile-first responsive design
- ✅ Telegram Mini App integration (ready)
- ✅ Role-based access control (Director, CEO)
- ✅ Professional UI with Tailwind CSS

### Coming Soon
- 🔜 Customers management
- 🔜 Sales tracking
- 🔜 Document management (RC, Insurance, PUCC)
- 🔜 Business reports and analytics
- 🔜 Marketing campaigns (WhatsApp, Facebook, Instagram)
- 🔜 CRM and test-drive booking
- 🔜 AI vehicle information and photo enhancement
- 🔜 Billing system

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Telegram Mini App + Supabase (ready for integration)
- **Icons**: Lucide React
- **Hosting**: Vercel-ready

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Redirect to dashboard
│   ├── globals.css          # Global styles
│   ├── dashboard/
│   ├── inventory/
│   ├── customers/
│   ├── sales/
│   ├── documents/
│   ├── reports/
│   ├── marketing/
│   └── settings/
├── components/
│   ├── Navigation.tsx        # Sidebar & mobile nav
│   ├── Card.tsx             # Card components
│   ├── StatCard.tsx         # Stat display card
│   ├── PageHeader.tsx       # Page header component
│   └── pages/
│       ├── Dashboard.tsx
│       ├── Inventory.tsx
│       ├── Customers.tsx
│       ├── Sales.tsx
│       ├── Documents.tsx
│       ├── Reports.tsx
│       ├── Marketing.tsx
│       └── Settings.tsx
└── providers/
    ├── TelegramProvider.tsx  # Telegram Mini App context
    └── AuthProvider.tsx      # Authentication context
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/lrgroup-bot/lrs-motors-mini-app.git
cd lrs-motors-mini-app

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## Environment Variables

See `.env.example` for all available configuration options. Key variables:

- `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` - Your Telegram bot token
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Dashboard Metrics

The dashboard displays:
- **Total Vehicles**: 48
- **Available**: 32 (+5 this week)
- **Reserved**: 8
- **Sold This Month**: 8 (+60%)
- **Total Sales**: ₹28.5L (+12%)
- **Estimated Profit**: ₹4.8L (+8%)
- **Customer Leads**: 12 active
- **Test Drives**: 5 scheduled

## Inventory Fields

Each vehicle includes:
- Registration Number
- Make, Model, Variant
- Year, Fuel Type, Kilometers
- Purchase & Selling Price
- Status (Available, Reserved, Sold)
- Photos
- Documents (RC, Insurance, PUCC)

## User Roles

### Director
Full access to all features including:
- Inventory management
- Customer management
- Sales tracking
- Reports and analytics
- Marketing campaigns
- User management
- Settings

### CEO
Full access (same as Director)

### Staff & Guest
Restricted access (configurable)

## Future Integrations

The application is architected for:
- **Supabase**: Real-time database and authentication
- **WhatsApp Business API**: Customer messaging
- **Facebook/Instagram**: Marketing and sales channels
- **OpenAI**: Vehicle information and photo enhancement
- **Stripe**: Billing and payments
- **CRM**: Advanced customer relationship management
- **Test Drive Booking**: Calendar integration

## Security Notes

⚠️ **No credentials are committed to the repository**
- All API keys and tokens go in `.env.local` (never in `.env.example`)
- Telegram Mini App validates user authentication server-side
- Supabase handles secure database operations
- Role-based access control enforces permissions

## Mobile Responsiveness

The app is fully responsive:
- **Mobile**: Bottom navigation changes to side drawer
- **Tablet**: Optimized grid layouts
- **Desktop**: Full sidebar navigation

## Performance

- Static generation for pages
- Image optimization ready
- Tailwind CSS purging
- Code splitting by route
- Vercel deployment ready

## License

Private - LRS Motors

## Support

For issues or feature requests, please contact the development team.

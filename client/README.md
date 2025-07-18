# Client (Frontend)

This folder contains the Next.js frontend application for the Inventory Management System.

## Technology Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Recharts** - Charts and data visualization
- **Lucide React** - Icon library

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (routes)/          # Route groups
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── ui/                # UI primitives
│   └── auth/              # Authentication components
├── contexts/              # React contexts
├── lib/                   # Utility functions and configurations
└── types/                 # TypeScript type definitions
```

## Key Features

- Product management interface
- Customer management
- Invoice creation and management
- Analytics dashboard
- Reports generation
- Authentication system

## Configuration Files

- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint configuration
- `postcss.config.mjs` - PostCSS configuration
- `package.json` - Dependencies and scripts

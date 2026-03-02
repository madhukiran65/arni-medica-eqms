# Arni Medica eQMS Frontend

React 18 + Vite 5 + Tailwind CSS frontend for the Arni Medica electronic Quality Management System.

**Status:** Production Ready ✅ | All 11 modules complete | TipTap editor integrated

## Tech Stack

- **React 18** - UI framework
- **Vite 5** - Next-generation build tool
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **TipTap 3.20** - Rich text editor for documents
- **Axios** - HTTP client with JWT auto-refresh
- **Recharts** - Charts & visualizations
- **Lucide React** - 400+ icons
- **React Hot Toast** - Toast notifications
- **React Hook Form** - Form validation & handling
- **Yup** - Schema validation
- **sanitize-html** - XSS prevention

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Runs at http://localhost:3000 with proxy to backend at https://web-production-4b02.up.railway.app

### Build

```bash
npm run build
```

Outputs optimized build to `/dist` for production deployment.

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── api/              # API client and service functions
├── components/       # Reusable React components
│   ├── common/      # Shared components (buttons, modals, etc)
│   └── layout/      # Layout components (Sidebar, Header)
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── pages/           # Page components for each module
├── styles/          # Global styles
├── utils/           # Utility functions
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```

## Features

### 1. Dashboard
- KPI widgets (Compliance Score, Open CAPAs, Documents, Audit Readiness)
- Quality metrics charts (6-month trend)
- CAPA status pie chart
- Recent activity feed

### 2. Authentication
- JWT token-based auth
- Protected routes
- Login page with form validation
- Auto-logout on token expiration

### 3. Navigation
- Responsive sidebar navigation
- Mobile hamburger menu
- Submenu support for Quality Events
- Active route highlighting

### 4. API Integration
- Axios HTTP client with interceptors
- Token auto-injection
- 401 error handling
- Demo data fallback

### 5. Styling
- Dark theme by default (medical device UI best practice)
- Tailwind CSS utility classes
- Lucide icons
- Responsive grid layouts

## Environment Variables

Create `.env.local`:

```
VITE_API_URL=https://your-api-domain/api
VITE_APP_NAME=Arni Medica AI-EQMS
```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
RUN npm install -g serve
COPY --from=builder /app/dist /app
CMD ["serve", "-s", "/app", "-l", "3000"]
```

## Module Implementation Status (Session 29)

- [x] Dashboard — KPI widgets, quality metrics, recent activity
- [x] Document Control — List, create (with TipTap editor), edit, detail, delete
- [x] Quality Events — CAPA, Deviations, Change Control (all with API integration)
- [x] Complaints/PMS — Full workflow and trending
- [x] Audit & Regulatory — Audit plans, findings, effectiveness
- [x] Training Management — Training records, quizzes, competency tracking
- [x] Supplier Management — Supplier profiles, evaluations
- [x] Risk & Design Controls — Risk assessments, design verification
- [x] Equipment & Facilities — Equipment tracking, calibration, environmental monitoring
- [x] Production & QA — Batch records, inspection, stability studies
- [x] Analytics & Insights — KPI dashboards, trend analysis, predictive analytics
- [x] Administration — User/role management, workflow builder, settings

**Status:** All 11 modules complete with frontend pages

## Contributing

1. Follow Arni Medica code style
2. All pages must connect to actual API (zero hardcoded data)
3. Maintain accessibility standards
4. Test on mobile and desktop

## License

Proprietary - Arni Medica

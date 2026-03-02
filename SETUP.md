# Arni Medica eQMS Frontend - Setup Guide

## Project Structure Created

```
arni-medica-eqms-frontend/
├── src/
│   ├── api/                    # API integration
│   │   └── client.js          # Axios client with interceptors
│   ├── components/
│   │   ├── common/            # Reusable components (Button, Card)
│   │   └── layout/            # Layout components (Sidebar, Header, Layout)
│   ├── contexts/              # React Contexts
│   │   ├── AuthContext.jsx    # JWT authentication state
│   │   └── ThemeContext.jsx   # Dark/light mode
│   ├── hooks/                 # Custom React hooks
│   │   └── useAuth.js        # useAuth hook
│   ├── pages/                 # Page components
│   │   ├── Login.jsx         # Login page
│   │   └── dashboard/        # Dashboard module
│   │       └── Dashboard.jsx # Dashboard with KPIs & charts
│   │   └── documents/        # Document Control
│   │   ├── capa/            # CAPA management
│   │   ├── complaints/      # Complaints/PMS
│   │   ├── deviations/      # Deviations
│   │   ├── change-controls/ # Change Control
│   │   ├── training/        # Training Management
│   │   ├── audits/          # Audit & Regulatory
│   │   ├── suppliers/       # Supplier Management
│   │   ├── risk/            # Risk & Design Controls
│   │   ├── equipment/       # Equipment & Facilities
│   │   ├── production/      # Production & QA
│   │   ├── analytics/       # Analytics & Insights
│   │   └── admin/           # Administration
│   ├── styles/               # Global styles
│   ├── utils/                # Utility functions & constants
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Main app component with routing
│   └── index.css            # Tailwind CSS directives
├── public/                   # Static assets
├── index.html               # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── package.json            # Dependencies
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── README.md               # Project documentation
└── SETUP.md               # This file
```

## Installation & Running

### 1. Install Dependencies
```bash
cd arni-medica-eqms-frontend
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your API URL
```

### 3. Start Development Server
```bash
npm run dev
```
- Opens at http://localhost:3000
- Automatically proxies /api requests to backend
- Hot module replacement enabled

### 4. Build for Production
```bash
npm run build
```
- Outputs optimized build to `/dist`
- Ready for deployment

## Features Implemented

### Authentication
- JWT token-based authentication
- Login page with email/password
- Auto token injection in API requests
- 401 error handling with auto-logout
- Protected routes

### Layout & Navigation
- Responsive dark theme layout
- Sidebar navigation with submenu support
- Mobile hamburger menu
- Header with user profile & notifications
- Active route highlighting

### Dashboard Module (Ready)
- 4 KPI cards (Compliance Score, Open CAPAs, Documents, Audit Readiness)
- 6-month quality metrics line chart
- CAPA status pie chart
- Recent activity feed
- Demo data fallback

### Components
- AuthContext - JWT authentication management
- ThemeContext - Dark/light mode toggle
- Layout - Main layout wrapper
- Sidebar - Navigation menu
- Header - Top bar with user info
- Button - Reusable button component
- Card - Reusable card component
- Login - Authentication page
- Dashboard - Main dashboard page
- Documents - Document control page (template)

### Styling
- Tailwind CSS with custom eQMS color palette
- Dark theme optimized for medical devices
- Responsive grid layouts (mobile, tablet, desktop)
- Gradient buttons and hover effects
- Custom scrollbar styling

### API Integration
- Axios HTTP client with interceptors
- Base URL from environment variables
- Auto token injection on requests
- Error handling with 401 redirect
- Demo data fallback when API unavailable

## Tech Stack Details

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI Framework |
| React Router | 6.26.0 | Client routing |
| Vite | 5.3.4 | Build tool & dev server |
| Tailwind CSS | 3.4.4 | Styling |
| Axios | 1.7.0 | HTTP client |
| Recharts | 2.12.0 | Charts & graphs |
| Lucide React | 0.400.0 | Icons |
| React Hot Toast | 2.4.1 | Notifications |
| Date-fns | 3.6.0 | Date utilities |

## Development Workflow

### Creating a New Page
1. Create file in `src/pages/module-name/`
2. Import in `App.jsx`
3. Add route in Routes
4. Add navigation in Sidebar if needed
5. Use API client for backend calls

### Adding a Component
1. Create in `src/components/common/` or `src/components/layout/`
2. Follow naming convention (PascalCase)
3. Export as default or named export
4. Document props in JSDoc comments

### API Calls
```javascript
import client from '../api/client'

// GET
const res = await client.get('/endpoint')

// POST
const res = await client.post('/endpoint', { data })

// Error handling
try {
  const res = await client.get('/endpoint')
} catch (err) {
  console.error(err.response?.data)
}
```

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Railway
1. Connect GitHub repo
2. Select `arni-medica-eqms-frontend` directory
3. Add environment variables:
   - `VITE_API_URL=https://your-backend-url/api`
4. Deploy

### Docker
```bash
docker build -t arni-medica-frontend .
docker run -p 3000:3000 arni-medica-frontend
```

## Next Steps

### Phase 1 - Core Modules
1. Connect Dashboard to real API endpoints
2. Build Document Control list/create/detail views
3. Implement CAPA module with workflow UI
4. Add approval forms with e-signature placeholder

### Phase 2 - Quality Events
1. Build Deviations module
2. Build Change Control module
3. Implement workflow state transitions
4. Add audit trail display

### Phase 3 - Advanced Features
1. Training module with progress tracking
2. Supplier management
3. Risk & Design Controls
4. Equipment calibration tracking
5. Production batch records

### Phase 4 - Analytics & Admin
1. Analytics dashboard with custom charts
2. User management interface
3. Role-based permission UI
4. Workflow builder UI
5. Settings & configuration

## Troubleshooting

### Port 3000 already in use
```bash
npm run dev -- --port 3001
```

### API connection issues
1. Check `.env.local` has correct API URL
2. Verify backend is running
3. Check CORS headers in backend
4. View browser console for error details

### Tailwind classes not applying
1. Check content paths in `tailwind.config.js`
2. Restart dev server
3. Clear `.next` or `dist` folder

## File Size Optimization

Current bundle size (uncompressed):
- React & dependencies: ~300 KB
- Custom code: ~50 KB
- CSS: ~30 KB

Optimizations applied:
- Tree shaking in Vite
- CSS purging with Tailwind
- Code splitting with React Router
- Lazy loading for routes

## Security Considerations

1. JWT tokens stored in localStorage (XSS vulnerable)
   - Consider moving to secure httpOnly cookies
2. API URL in .env files
   - Don't commit .env.local to version control
3. CORS enabled on backend for frontend domain
4. Input validation on all forms (TODO)
5. CSRF protection (TODO)

## Performance Tips

1. Enable compression on backend
2. Use CDN for static assets
3. Implement route lazy loading
4. Add image optimization
5. Monitor with Lighthouse

## Contributing Guidelines

1. Follow React hooks best practices
2. Use TypeScript for type safety (planned upgrade)
3. Keep components focused & reusable
4. Add error boundaries for production
5. Test responsive design on mobile
6. Validate API integration before merge

---

Created: 2025-03-01
Last Updated: 2025-03-01

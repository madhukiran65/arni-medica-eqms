# Arni Medica eQMS Frontend — Deployment Guide

## Option 1: Vercel (Recommended)

### Via GitHub Integration
1. Push code to `https://github.com/madhukiran65/arni-medica-eqms`
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the GitHub repo
4. Framework: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Add Environment Variable:
   - `VITE_API_URL` = `https://web-production-4b02.up.railway.app/api`
8. Deploy

### Via Vercel CLI
```bash
cd arni-medica-eqms-frontend
npx vercel login
npx vercel --prod
```

## Option 2: Manual Push to GitHub

```bash
cd arni-medica-eqms-frontend
git init
git remote add origin https://github.com/madhukiran65/arni-medica-eqms.git
git add -A
git commit -m "Session 15-16: Full frontend with API integration, validation, TipTap"
git push -f origin main
```

## Security Headers (vercel.json)
The `vercel.json` includes all 21 CFR Part 11 §11.30 required headers:
- HSTS (2 years, includeSubDomains, preload)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- CSP with Railway API whitelisted
- Permissions-Policy (camera/mic/geo/payment disabled)
- Referrer-Policy: strict-origin-when-cross-origin

## Environment Variables
| Variable | Value | Description |
|----------|-------|-------------|
| VITE_API_URL | https://web-production-4b02.up.railway.app/api | Backend API base URL |
| VITE_APP_NAME | Arni Medica AI-EQMS | App display name |

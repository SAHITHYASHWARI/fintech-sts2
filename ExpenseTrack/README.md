# ExpenseTrack - Frontend Dashboard

> Production-ready Vite + React + Tailwind CSS client built for **STS FINTECH PRIVATE LIMITED**.

## Features

- **Fintech Dark Theme Dashboard**: Modern slate/emerald palette, responsive card layouts, and typography.
- **Enterprise Header**: Branding for `STS FINTECH - Expense & Payment Tracking` with real-time backend connection monitor.
- **KPI Summary Metrics**: Total Outflow (₹ INR), Settled Payments, Pending Pipeline, and Average Ticket Size.
- **Payment Dispatch Form**: Live input validation, quick preset tags, and formatted INR currency previews submitting via `POST /api/payments`.
- **Real-Time Transaction Stream**: Fetches from `GET /api/payments` with instant search filter, status filter, formatted dates, and status badges.
- **Robust State Management**: Comprehensive loading skeletons, error recovery banners, and offline notifications.

## Tech Stack

- **React 18**
- **Vite**
- **Tailwind CSS**
- **Lucide React** (Fintech Icons)

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the ExpenseTrack1 backend | `http://localhost:5000` |

## Scripts

- `npm install` - Install frontend dependencies
- `npm run dev` - Launch Vite development server on port `5173`
- `npm run build` - Create optimized production bundle
- `npm run preview` - Preview production build

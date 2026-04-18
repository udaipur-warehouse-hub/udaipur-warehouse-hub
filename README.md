# Udaipur Warehouse Hub

A portal for renting out a 15,000 sq ft Grade-A warehouse located at Gukhar Magri, on the NH Golden Quadrilateral in Udaipur, Rajasthan.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database & Auth:** Supabase
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Validation:** Zod
- **Dates:** date-fns
- **Hosting:** Vercel

## Local Development

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/udaipur-warehouse-hub.git
   cd udaipur-warehouse-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase credentials and API keys in `.env.local`.

4. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Deployment

The app is deployed on Vercel, connected to the GitHub repo. Pushing to `main` triggers automatic deployments.

## Project Structure

```
app/
  (public)/       → Public-facing property pages
  (admin)/        → Admin dashboard (protected)
  api/            → API routes
components/
  ui/             → Reusable UI components
  public/         → Public page components
  admin/          → Admin dashboard components
lib/
  supabase/       → Supabase client setup (browser + server)
types/            → TypeScript type definitions
```

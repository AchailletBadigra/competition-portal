# Competition Portal

An internal admin portal for managing raffle competitions, built as a technical assessment.

## Tech Stack

- **Next.js 14** — Frontend and backend in one codebase. Chosen because this is an internal admin tool that doesn't need a separate API service.
- **Supabase** — PostgreSQL database, file storage, and auth in one platform. Avoids setting up multiple services separately.
- **Tailwind CSS + shadcn/ui** — Fast, clean UI without designing from scratch.
- **Resend** — Simple transactional email API for winner announcements.
- **React Hook Form + Zod** — Form management and validation with one shared schema.
- **xlsx** — Excel export for competition entries.

## Features

- Create competitions with cover image, gallery, ticket price, dates and descriptions
- Save competitions as draft or publish live
- Manage existing competitions — edit dates, price, ticket limit, delete
- View all competition entries in a table, filterable by competition
- Export entries to Excel spreadsheet
- Look up winner details by ticket number
- Send winner announcement email to all entrants

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/AchailletBadigra/competition-portal.git
cd competition-portal

2. Install dependencies

npm install

3. Set up environment variables

cp .env.example .env.local
Fill in your Supabase and Resend credentials in .env.local

4. Set up the database
Run the following SQL in your Supabase SQL Editor:


create table competitions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  short_description text,
  full_description text,
  cover_image text,
  gallery_images text[],
  ticket_price numeric not null,
  total_tickets integer not null,
  start_date date,
  end_date date,
  status text default 'draft',
  upsells uuid[],
  created_at timestamp default now()
);

create table entries (
  id uuid default gen_random_uuid() primary key,
  competition_id uuid references competitions(id) on delete cascade,
  name text not null,
  email text not null,
  ticket_number integer not null,
  purchased_at timestamp default now()
);

5. Run the development server

npm run dev
Open http://localhost:3000

What I would add with more time
Authentication — Protect the portal with email/password login via Supabase Auth
Stripe integration — Real ticket purchases tied automatically to entries
Role-based access — Super admin, agent, and viewer roles
Email queue — Use a job queue for reliable bulk email sending at scale
Audit logs — Track who changed what and when, critical for money-related features
Customer-facing side — Public competition pages where customers browse and buy tickets
```

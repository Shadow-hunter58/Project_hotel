# 🏨 Hotel Ratna Forever, Nitte

> **Official Website & Direct Reservation Engine for Hotel Ratna Forever**  
> *Premier hospitality, authentic coastal Mangalorean dining, and event banquets in Nitte, Karkala Taluk, Karnataka.*

[![Status](https://img.shields.io/badge/Status-Live%20%26%20Production%20Ready-emerald.svg)](#)
[![Rating](https://img.shields.io/badge/Google%20Rating-4.1%20★%20(2%2C499%2B%20Reviews)-amber.svg)](#)
[![Framework](https://img.shields.io/badge/Framework-TanStack%20Start%20%2F%20React-blue.svg)](#)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6.svg)](#)
[![Database](https://img.shields.io/badge/Database-Supabase%20(PostgreSQL)-3ecf8e.svg)](#)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg)](#)

---

## 📖 Overview

**Hotel Ratna Forever** is the flagship hospitality landmark situated on the Nitte main highway, minutes from the **NMAMIT** engineering campus and **Nitte Deemed to be University**. 

This web application provides an attractive, modern guest experience combining high-resolution property photography, showcase of celebrated coastal Tulu Nadu cuisine, and a **direct online booking engine** that records reservations straight to the hotel's database with integrated UPI advance payment verification—without requiring external booking intermediaries or WhatsApp messages.

---

## ✨ Key Features

### 🌟 1. Luxury Design System & Aesthetics
- **Curated Color Palette**: Deep midnight slate (`#020617`), warm gold/amber accents, and soft ivory tones.
- **Glassmorphism**: Translucent frosted glass containers (`.glass-card`), layered ambient glow, and high-contrast typography.
- **Micro-Interactions**: Shimmer buttons (`.shimmer-btn`), interactive cards with smooth elevations, and dynamic navigation state transitions.
- **Responsive Layout**: Designed for seamless browsing across ultra-wide monitors, standard laptops, tablets, and mobile devices with a slide-out drawer menu.

### 🏠 2. Streamlined 4-Page Architecture
All content has been consolidated into four clean, high-impact pages:

| Page | Route | Description |
|---|---|---|
| **Home** | `/` | Cinematic hero, live booking widget, trust stats, room previews, coastal dining highlights, hotel privileges grid, visual photo gallery, guest reviews, and embedded map. |
| **Rooms & Suites** | `/rooms` | Detailed showcases for Deluxe Rooms, Executive Rooms, and Family Suites with tariff breakdowns, amenities, and direct reservation triggers. |
| **Reservations** | `/reservations` | Multi-step booking engine with real-time Supabase inventory checks, booking reference issuance, and integrated UPI advance payments. |
| **Contact & Location** | `/contact` | Full address, interactive Google Maps, key travel distance matrix (campus, airport, railway), and 24/7 front desk phone. |

### ⚡ 3. Functional Direct Booking Engine
- **Live Inventory Inquiries**: Queries real-time room availability via the `get_availability` Supabase RPC function based on selected check-in and check-out dates.
- **Step-by-Step Booking Wizard**:
  1. **Dates & Occupancy**: Safe date validation, night count calculations, and guest selection (adults & children).
  2. **Room Selection**: Real-time available unit counts, transparent pricing per night, and total estimated stay cost.
  3. **Guest Information**: Name, phone number, optional email, and special requests (e.g. early arrival, dietary needs).
  4. **Instant Confirmation**: Generates a unique booking reference code (e.g. `RF-8921`) and automatically logs the stay in the front desk management system.
- **Integrated UPI Advance Payment**:
  - Direct payment instructions to the hotel UPI ID (`ratnaforever@upi`).
  - Pre-configured advance amounts (₹500, ₹1,000, or full estimated total).
  - Deep-link support for mobile UPI applications (Google Pay, PhonePe, Paytm, BHIM).
  - Instant submission of the 12-digit UPI UTR / Transaction Reference ID using the `record_payment` RPC.
- **Existing Reservation Lookup**:
  - Returning guests can input their reference code and contact number to check their confirmation and payment status or submit a payment reference anytime.

### 🍽️ 4. The Celebrated Coastal Kitchen
- Showcases the hotel's renowned Mangalorean seafood cuisine prepared with fresh Malpe catch and native Byadgi ghee roast marinades:
  - *Prawn Ghee Roast*
  - *Kane (Ladyfish) Fish Masala Fry*
  - *Neer Dosa & Chicken Sukka*
  - *Authentic South Indian Breakfast & Filter Coffee*
- Details breakfast hours (7:30 AM – 10:30 AM) and room service availability (until 11:00 PM).

### 🏛️ 5. Facilities & Event Banquets
- Comprehensive details on the 300-seat wedding and reception banquet hall, air-conditioned seminar room, ample highway parking, generator power backup, and laundry services.

---

## 🛠️ Technology Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (Full-stack React framework with SSR & file-based routing)
- **Language**: TypeScript (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom design system variables & glassmorphism utilities
- **Database / Backend**: [Supabase](https://supabase.com/) (PostgreSQL with custom atomic stored procedures)
- **Data Querying**: [TanStack React Query](https://tanstack.com/query)
- **Icons & Visuals**: Custom SVG vector iconography and real high-resolution hotel photography
- **Build Tool**: Vite 8

---

## 📁 Repository Structure

```text
├── drizzle/                    # Drizzle ORM schema & migration SQL files
│   ├── migrations/             # Database migrations (0000_create_booking_system.sql)
│   └── schema.ts               # Database schema definition
├── public/                     # Static assets (favicons, robots.txt)
├── src/
│   ├── assets/                 # Hotel exterior, interior, lounge, and dining photography
│   ├── components/             # Reusable UI components
│   │   ├── SiteChrome.tsx      # Global sticky header, navigation, PageHeader, and footer
│   │   └── ui/                 # Radix / Tailwind UI primitives (buttons, dialogs, cards)
│   ├── integrations/           # Third-party integrations
│   │   └── supabase/           # Supabase client setup, types, and authentication middleware
│   ├── lib/                    # Application utilities
│   │   ├── booking.ts          # Supabase RPC wrappers (fetchAvailability, createBooking, etc.)
│   │   ├── site-data.ts        # Hotel contact info, room metadata, menus, and gallery items
│   │   └── utils.ts            # Classnames & styling helpers
│   ├── routes/                 # File-based TanStack Start routes
│   │   ├── __root.tsx          # Root layout shell with HTML head, metadata, and fonts
│   │   ├── index.tsx           # Consolidated luxury homepage
│   │   ├── rooms.tsx           # Accommodations & suites page
│   │   ├── reservations.tsx    # Direct booking engine & UPI payment portal
│   │   └── contact.tsx         # Contact info, travel distances, and map
│   ├── routeTree.gen.ts        # Automatically generated TanStack Router tree
│   ├── router.tsx              # Router instance configuration
│   ├── start.ts                # TanStack Start entry point
│   └── styles.css              # Design system tokens, oklch colors, and animations
├── supabase/                   # Supabase local configuration & CLI settings
├── package.json                # Project dependencies and npm scripts
└── vite.config.ts              # Vite bundler configuration
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` or `bun`

### 1. Clone the Repository
```bash
git clone https://github.com/Shadow-hunter58/Project_hotel.git
cd Project_hotel
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (or use the configured Supabase connection):

```env
VITE_SUPABASE_URL="https://your-supabase-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
```

### 4. Start the Development Server
```bash
npm run dev
```

The site will be available locally at `http://localhost:8080/`.

---

## 🗄️ Database Architecture (Supabase RPCs)

The booking system communicates with PostgreSQL stored procedures for ACID-compliant transactions:

- `get_availability(_check_in, _check_out)`: Returns available room counts and tariffs per night across all room categories.
- `create_booking(_room_type_id, _guest_name, _guest_phone, _guest_email, _check_in, _check_out, _adults, _children, _rooms, _notes)`: Atomically reserves the room, verifies availability, and generates a formatted booking reference code.
- `lookup_booking(_reference, _guest_phone)`: Retrieves booking details, payment status, and estimated totals for guest check-ins.
- `record_payment(_reference, _guest_phone, _payment_reference)`: Logs UPI payment references/UTRs against existing reservations for front-desk audit.

---

## 📍 Hotel Information

- **Address**: Hotel Ratna Forever, Nitte Parapady, Karkala Taluk, Udupi District, Karnataka 574110, India
- **Front Desk**: +91 73380 88744
- **Check-in**: 12:00 PM onwards
- **Check-out**: 11:00 AM
- **UPI ID**: `ratnaforever@upi` (Hotel Ratna Forever)

---

## 📄 License

This repository is developed for Hotel Ratna Forever. All rights reserved © 2026.

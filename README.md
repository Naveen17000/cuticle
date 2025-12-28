# 🛡️ Cuticle: Post-Quantum Encrypted Messaging

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-development-orange)
![Stack](https://img.shields.io/badge/tech-Next.js%20%7C%20Supabase%20%7C%20TypeScript-black)

**Cuticle** is a next-generation real-time messaging application built to resist "Harvest Now, Decrypt Later" attacks. It combines a modern, responsive UI with the architecture for Post-Quantum Cryptography (PQC) using the CRYSTALS-Kyber algorithm standards.

## ✨ Features

- **⚛️ Post-Quantum Readiness:** Designed to support NIST-standardized PQC algorithms (Kyber-1024).
- **⚡ Real-Time Sync:** Instant message delivery using Supabase Realtime (WebSockets).
- **👀 Presence & Typing:** Live typing indicators and online status via ephemeral Broadcast channels.
- **🔐 Zero Trust Architecture:** Row Level Security (RLS) ensures data isolation at the database engine level.
- **🎨 Modern UX:** Built with Tailwind CSS, Framer Motion animations, and glassmorphism effects.

## 🛠️ Tech Stack

- **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), TypeScript
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling:** Tailwind CSS, shadcn/ui
- **Animations:** Framer Motion
- **Icons:** Lucide React

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Prerequisites

- Node.js 18+ installed
- A [Supabase](https://supabase.com/) account
- Git

### 2. Environment Configuration

Create a `.env.local` file in the root directory and add the following keys.

```bash
# ------------------------------------------------------------------
# REQUIRED: Client-Side Connection
# ------------------------------------------------------------------
# Found in Supabase Settings > API
NEXT_PUBLIC_SUPABASE_URL="[https://your-project-id.supabase.co](https://your-project-id.supabase.co)"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-public-anon-key"

# ------------------------------------------------------------------
# OPTIONAL: Server-Side Admin (Not required for basic chat)
# ------------------------------------------------------------------
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# ------------------------------------------------------------------
# IGNORED: The following are not used by the Supabase JS Client
# ------------------------------------------------------------------
# POSTGRES_URL=...
# SUPABASE_JWT_SECRET=...
```
### 3. Database Setup (Supabase)
Go to the SQL Editor in your Supabase Dashboard and run the following script to create the tables and security policies.

### 4. Run the application
npm run dev

📄 License
Distributed under the MIT License. See LICENSE for more information.

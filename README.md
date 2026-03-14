# forme.ai — AI-Powered Dynamic Form & Quiz Builder

> Build beautiful forms and quizzes in seconds using natural language. Powered by **Gemini AI**, built with **Next.js**, and backed by **Supabase**.

## ✨ What It Does

**forme.ai** lets you create professional forms and quizzes by simply describing what you need in plain English. The AI generates a complete, interactive form that you can share with anyone via a unique link — and track all responses through a real-time analytics dashboard.

### Key Features

- 🤖 **AI-Powered Generation** — Describe your form in natural language, get a professional form in seconds
- 📝 **Dynamic Form Rendering** — Supports text inputs, textareas, radio buttons, checkboxes, and dropdown selects
- 🔗 **Shareable Links** — Every form gets a unique URL that anyone can access and fill out
- 📊 **Live Analytics Dashboard** — Real-time response tracking with data tables and Recharts visualizations
- 🎨 **Premium Dark UI** — Stunning glassmorphism design with smooth animations and gradient accents

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Google Gemini 2.0 Flash |
| **Styling** | Tailwind CSS v4 + Shadcn UI |
| **Charts** | Recharts |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/forme.git
   cd forme
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. **Set up Supabase database**
   Run the SQL from `supabase/schema.sql` in Supabase SQL Editor.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) 🎉

## 🏗️ Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/route.ts    # AI form generation endpoint
│   │   │   └── submit/route.ts      # Form submission endpoint
│   │   ├── f/[id]/page.tsx          # Public form page
│   │   ├── dashboard/[id]/page.tsx  # Analytics dashboard
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Home/Hero page
│   ├── components/
│   │   ├── ui/                      # Shadcn UI components
│   │   ├── DynamicForm.tsx          # Dynamic form renderer
│   │   ├── AnalyticsChart.tsx       # Recharts analytics
│   │   └── SubmissionsTable.tsx     # Response data table
│   └── lib/
│       ├── supabase.ts              # Supabase client
│       ├── gemini.ts                # Gemini AI client
│       ├── types.ts                 # TypeScript types
│       └── utils.ts                 # Utility functions
├── supabase/
│   └── schema.sql                   # Database schema
├── testsprite_tests/                # AI-generated test cases (TestSprite)
├── README.md
└── demo.mp4
```

## 🧪 Testing

All tests are auto-generated using the **TestSprite MCP** agent. The generated test cases are located in the `testsprite_tests/` directory.

## 📄 License

MIT

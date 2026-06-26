# Serverless Todo App (Ionic React + Supabase)

A secure, responsive, and cross-platform Todo application built with **Ionic Framework**, **React**, and **TypeScript**, powered by **Supabase** (PostgreSQL) for authentication and database management.

This project is serverless and communicates directly with Supabase, securing user data using PostgreSQL **Row Level Security (RLS)** policies.

---

## 🚀 Tech Stack

* **Frontend**: [Ionic Framework](https://ionicframework.com/) with React, TypeScript, and Vite.
* **Database & Authentication**: [Supabase](https://supabase.com/) (PostgreSQL & GoTrue Auth).
* **Styling**: Vanilla CSS with Ionic UI Components (sleek animations, native cards, responsive grid layouts).

---

## 🛠️ Getting Started / Local Setup

Follow these step-by-step instructions to get a local copy of this project up and running.

### 📋 Prerequisites

* **Node.js**: `v18.0.0` or higher installed (tested on `v25.9.0`).
* **Supabase Project**: You need a free account and project set up on [Supabase](https://supabase.com/).

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/selmanulfarisy/ToDo.git
cd ToDo
```

---

### Step 2: Configure Supabase Database & Security (RLS)
1. Go to your **Supabase Project Dashboard** and open the **SQL Editor**.
2. Run the following query to create the `todos` table and configure **Row Level Security (RLS)** so users can only access their own items:

```sql
-- Create the todos table
create table todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  is_completed boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table todos enable row level security;

-- Define RLS Access Policies
create policy "Users can view their own todos" 
  on todos for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own todos" 
  on todos for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own todos" 
  on todos for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own todos" 
  on todos for delete 
  using (auth.uid() = user_id);
```

3. **Disable Email Confirmation (Highly recommended for testing)**:
   * Navigate to **Authentication** -> **Providers** -> **Email**.
   * Turn the **Confirm email** toggle **OFF** and save. This prevents email rate-limiting and logs users in immediately upon sign up.

---

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
```

---

### Step 4: Setup Environment Variables
1. Create a `.env` file inside the `frontend/` folder:
   ```bash
   touch .env
   ```
2. Copy your Supabase URL and Anon Key from **Project Settings** -> **API** and add them to the file:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-api-key
   ```

---

### Step 5: Start the App
Run the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 📁 Project Structure

```text
ToDo/
├── .gitignore               # Root gitignore to protect environment configs
└── frontend/
    ├── .env                 # Your local Supabase secrets (GITIGNORED)
    ├── package.json         # Frontend dependencies and npm scripts
    └── src/
        ├── App.tsx          # Client Router (/login, /signup, /dashboard)
        ├── supabaseClient.ts # Supabase client initialization
        └── pages/
            ├── Login.tsx     # Sign In page (authenticates via Supabase GoTrue)
            ├── Signup.tsx    # Sign Up page (registers via Supabase GoTrue)
            └── Dashboard.tsx # Secure Todo CRUD interface
```

---

## ⚙️ Development Commands

Within the `frontend` folder, you can run:

* `npm run dev`: Starts the local hot-reloaded development server.
* `npm run build`: Compiles and optimizes the TypeScript project for production.
* `npm run lint`: Runs ESLint checks to enforce clean code standards.

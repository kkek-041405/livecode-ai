# LiveCode+

A live collaborative code editor with an AI assistant powered by Google Gemini.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, shadcn/ui, Tailwind CSS, Monaco Editor
- **Backend:** Node.js, Express, TypeScript, Google Gemini AI, Judge0 API

## Getting Started

```sh
# Clone the repo
git clone <YOUR_GIT_URL>

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Start backend (Terminal 1)
cd backend && npm run dev

# Start frontend (Terminal 2)
cd frontend && npm run dev
```

Frontend runs at `http://localhost:8080`, backend at `http://localhost:4000`.

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

- `GEMINI_API_KEY` — Google Gemini API key from [AI Studio](https://aistudio.google.com)
- `JUDGE0_KEY` — RapidAPI key for code execution (optional)

# Quick Start Guide

## ⚠️ Important: Start Backend First!

The frontend requires the backend to be running. Follow these steps:

## Step 1: Start Backend

Open a terminal and run:

```bash
cd backend
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Keep this terminal open!**

## Step 2: Start Frontend

Open a **NEW** terminal and run:

```bash
cd frontend
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

## Step 3: Open in Browser

Open `http://localhost:5173` in your browser.

## Troubleshooting

### Backend won't start?

1. Check if Python is installed: `python --version` (should be 3.11+)
2. Install dependencies: `pip install -r requirements.txt`
3. Check `.env` file has `GROQ_API_KEY` set
4. Make sure port 8000 is not in use

### Frontend shows "Cannot connect to backend"?

1. Make sure backend is running (Step 1)
2. Check backend is on `http://localhost:8000`
3. Check browser console for CORS errors

### CSS not working?

1. Restart the frontend dev server
2. Clear browser cache (Ctrl+Shift+R)
3. Check browser console for CSS errors

### TailwindCSS not generating?

1. Make sure `@tailwindcss/postcss` is installed: `npm list @tailwindcss/postcss`
2. Restart the dev server
3. Check `postcss.config.js` has `'@tailwindcss/postcss': {}`

## Both Servers Must Run Simultaneously!

- **Backend**: `http://localhost:8000` (Python/FastAPI)
- **Frontend**: `http://localhost:5173` (React/Vite)

Keep both terminals open while developing!



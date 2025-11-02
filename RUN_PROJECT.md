# 🚀 How to Run Your Project

Follow these steps to run your AI Resume Creator locally.

## ✅ Prerequisites Checklist

- [x] Python 3.10 installed
- [x] Virtual environment created
- [x] Dependencies installed
- [x] `.env` file configured
- [x] Groq API key added

## 🎯 Run the Backend

### Option 1: Using venv Python Directly (Recommended if PowerShell has script restrictions)

Open a terminal and run:

```bash
cd C:\ai-resume-creator\backend

# Initialize database (first time only)
.\venv\Scripts\python.exe init_db.py

# Start the server
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

### Option 2: Activate Virtual Environment First

If you can activate PowerShell scripts:

```bash
cd C:\ai-resume-creator\backend

# Change execution policy (one-time setup)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Initialize database (first time only)
python init_db.py

# Start the server
uvicorn app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

✅ **Backend running at: http://localhost:8000**

## 🎨 Run the Frontend

Open a **NEW terminal window** and run:

```bash
cd C:\ai-resume-creator\frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm start
```

This will automatically open http://localhost:3000 in your browser.

✅ **Frontend running at: http://localhost:3000**

## 🎉 You're Done!

Your application should now be running!

1. Open http://localhost:3000 in your browser
2. Click "Sign Up" to create an account
3. Create your first AI-powered resume!

## 🐛 Troubleshooting

### "ModuleNotFoundError" when running backend

Make sure you're using the venv Python:
```bash
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

### "Execution policy" error in PowerShell

Run this once to allow scripts:
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port 8000 already in use

Kill the process using port 8000:
```bash
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

Or use a different port:
```bash
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8001
```

### Frontend can't connect to backend

Make sure:
1. Backend is running at http://localhost:8000
2. Check backend logs for errors
3. Verify `.env` file has correct settings

### No API docs showing

Visit http://localhost:8000/docs directly in your browser.

## 📚 Quick Reference

### Backend Commands
```bash
cd C:\ai-resume-creator\backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

### Frontend Commands
```bash
cd C:\ai-resume-creator\frontend
npm start
```

### Useful URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

---

**Need help?** Check the other documentation files or run the commands above!



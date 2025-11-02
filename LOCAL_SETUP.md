# 🚀 How to Run Your AI Resume Creator Project Locally

Follow these step-by-step instructions to get your project running on your local machine.

## Prerequisites

Make sure you have installed:
- ✅ **Node.js 16+** (check with `node --version`)
- ✅ **Python 3.8+** (check with `python --version`)
- ✅ **npm** (comes with Node.js)
- ✅ **pip** (comes with Python)

## Step 1: Get a Groq API Key (Required)

1. Visit https://console.groq.com/
2. Sign up with Google or GitHub
3. Go to "API Keys" section
4. Click "Create API Key"
5. Copy your API key (you'll need it in Step 3)

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd ai-resume-creator/backend
```

### 2.2 Create Virtual Environment

**Windows:**
```bash
python -m venv venv
```

**Linux/Mac:**
```bash
python3 -m venv venv
```

### 2.3 Activate Virtual Environment

**Windows (PowerShell):**
```bash
venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```bash
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

You should see `(venv)` in your prompt when activated.

### 2.4 Install Dependencies

```bash
pip install -r requirements.txt
```

This will install all Python packages. It may take a few minutes.

### 2.5 Create Environment File

**Windows:**
```bash
copy .env.example .env
```

**Linux/Mac:**
```bash
cp .env.example .env
```

### 2.6 Configure Environment Variables

Open the `.env` file in a text editor and update:

```env
# Generate a secure SECRET_KEY by running:
# python -c "import secrets; print(secrets.token_urlsafe(32))"

DATABASE_URL=sqlite:///./resume.db
SECRET_KEY=PASTE_YOUR_GENERATED_SECRET_KEY_HERE
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Add your Groq API key from Step 1
GROQ_API_KEY=PASTE_YOUR_GROQ_API_KEY_HERE

# Optional: Add OpenAI key if you have one
OPENAI_API_KEY=

GROQ_MODEL=llama-3.1-70b-versatile
OPENAI_MODEL=gpt-3.5-turbo

CORS_ORIGINS=http://localhost:3000

ENVIRONMENT=development
```

**To generate SECRET_KEY**, run:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and paste it into `.env` as `SECRET_KEY`.

### 2.7 Initialize Database

```bash
python init_db.py
```

This creates the SQLite database file.

### 2.8 Start Backend Server

```bash
uvicorn app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

✅ **Backend is now running!**

Open http://localhost:8000/docs in your browser to see the API documentation.

## Step 3: Frontend Setup

### 3.1 Open New Terminal Window

Keep the backend running, open a **new terminal window**.

### 3.2 Navigate to Frontend Directory

```bash
cd ai-resume-creator/frontend
```

### 3.3 Install Dependencies

```bash
npm install
```

This will install all Node.js packages. It may take a few minutes.

### 3.4 Start Frontend Server

```bash
npm start
```

This will automatically open http://localhost:3000 in your browser.

✅ **Frontend is now running!**

## Step 4: Use the Application

1. You should see the AI Resume Creator homepage
2. Click "Sign Up" to create an account
3. Fill in your name, email, and password
4. Click "Create account"
5. You'll be redirected to login
6. Login with your credentials
7. Click "Create Resume" or "Create New Resume"
8. Fill out the resume builder form:
   - Personal information (name, email, etc.)
   - Professional summary
   - Education (click + Add Education)
   - Experience (click + Add Experience)
   - Skills (type and click Add)
9. Click "Generate Resume with AI"
10. Wait for AI to generate your resume
11. Preview your resume
12. Download as PDF or DOCX!

## Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:** Make sure virtual environment is activated and dependencies are installed:
```bash
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

**Problem:** `Could not open requirements file`

**Solution:** Make sure you're in the `backend` directory:
```bash
cd ai-resume-creator/backend
```

**Problem:** Port 8000 already in use

**Solution:** Either stop the other application or use a different port:
```bash
uvicorn app.main:app --reload --port 8001
```

**Problem:** `ERROR: Failed to generate resume`

**Solution:** Check your `.env` file has a valid `GROQ_API_KEY`

### Frontend Issues

**Problem:** `Error: Cannot find module`

**Solution:** Reinstall dependencies:
```bash
cd frontend
rm -rf node_modules package-lock.json  # Linux/Mac
rmdir /s /q node_modules package-lock.json  # Windows
npm install
```

**Problem:** Port 3000 already in use

**Solution:** Use a different port:
```bash
PORT=3001 npm start
```

**Problem:** Can't connect to backend

**Solution:** Make sure backend is running at http://localhost:8000. Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:8000
```

**Problem:** CORS errors

**Solution:** Make sure backend `.env` has:
```env
CORS_ORIGINS=http://localhost:3000
```
And restart the backend server.

## Quick Reference

### Start Backend (Terminal 1)
```bash
cd ai-resume-creator/backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
uvicorn app.main:app --reload
```

### Start Frontend (Terminal 2)
```bash
cd ai-resume-creator/frontend
npm start
```

### Access URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Stop Servers
- Press `Ctrl+C` in the terminal to stop either server

## Next Steps

1. ✅ Create your first resume
2. ✅ Save multiple resumes
3. ✅ Download in different formats
4. 📖 Read the documentation
5. 🚀 Deploy to production (see DEPLOYMENT.md)

## Need Help?

1. Check the error messages in terminal
2. Review the troubleshooting section above
3. See http://localhost:8000/docs for API documentation
4. Check browser console (F12) for frontend errors
5. Read SETUP.md for more detailed instructions

---

**Happy Resume Creating! 🎉**


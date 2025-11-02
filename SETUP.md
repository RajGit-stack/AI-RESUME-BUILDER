# Setup Instructions

## Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.8+
- **Groq API Key** (free): Get from https://console.groq.com/
- **OpenAI API Key** (optional, free credits available): Get from https://platform.openai.com/

## Backend Setup

### 1. Navigate to backend directory

```bash
cd backend
```

### 2. Create and activate virtual environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
DATABASE_URL=sqlite:///./resume.db
SECRET_KEY=your-secret-key-here-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key

GROQ_MODEL=llama-3.1-70b-versatile
OPENAI_MODEL=gpt-3.5-turbo

CORS_ORIGINS=http://localhost:3000

ENVIRONMENT=development
```

**To generate a secure SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5. Initialize database

```bash
python init_db.py
```

### 6. Run the backend server

```bash
uvicorn app.main:app --reload
```

The backend will be running at `http://localhost:8000`

You can access the API docs at `http://localhost:8000/docs`

## Frontend Setup

### 1. Navigate to frontend directory

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

This will install:
- React and React DOM
- React Router for navigation
- Axios for API calls
- TailwindCSS for styling
- React Markdown for rendering
- And other necessary packages

### 3. Configure environment variables (optional)

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

### 4. Run the frontend

```bash
npm start
```

The frontend will be running at `http://localhost:3000`

## Using the Application

1. Open `http://localhost:3000` in your browser
2. Click "Sign Up" to create an account
3. After registration, you'll be redirected to login
4. Login with your credentials
5. Click "Create Resume" to start building your resume
6. Fill in your information:
   - Personal details
   - Professional summary
   - Education
   - Work experience
   - Skills
7. Click "Generate Resume with AI"
8. Preview your generated resume
9. Download as PDF or DOCX, or save to your dashboard

## Project Structure

```
ai-resume-creator/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI app
│   │   ├── config.py         # Configuration
│   │   ├── database.py       # Database setup
│   │   ├── models.py         # Database models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── auth.py           # Authentication
│   │   ├── routers/          # API routes
│   │   │   ├── auth.py
│   │   │   └── resumes.py
│   │   └── services/         # Business logic
│   │       ├── ai_service.py
│   │       └── export_service.py
│   ├── requirements.txt
│   ├── .env.example
│   └── init_db.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # Context API
│   │   └── services/        # API services
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Troubleshooting

### Backend Issues

**Module not found errors:**
```bash
pip install -r requirements.txt
```

**Database errors:**
```bash
python init_db.py
```

**Port already in use:**
```bash
uvicorn app.main:app --reload --port 8001
```

### Frontend Issues

**Module not found errors:**
```bash
npm install
```

**Port already in use:**
```bash
PORT=3001 npm start
```

**TailwindCSS not working:**
Make sure you have `tailwind.config.js` and `postcss.config.js` in the frontend directory.

### AI Generation Issues

**API key errors:**
- Make sure you've added your API keys to `.env`
- Verify the keys are correct
- Check if you have remaining API credits

**Generation failures:**
- Check your internet connection
- Verify the AI service is accessible
- Check backend logs for error details

## Production Deployment

### Deploy Backend (Render)

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your GitHub repo
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables
7. Deploy

### Deploy Frontend (Vercel)

1. Push code to GitHub
2. Import project on Vercel
3. Add environment variables:
   - `REACT_APP_API_URL`: Your backend URL
4. Deploy

### Database (Supabase)

For production, update `DATABASE_URL` in backend `.env` to your Supabase PostgreSQL URL.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs
3. Check frontend console for errors
4. Verify all environment variables are set correctly


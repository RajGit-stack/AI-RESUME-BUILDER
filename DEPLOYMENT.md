# Deployment Guide

This guide will walk you through deploying the AI Resume Creator to production using free hosting services.

## Overview

- **Frontend**: Vercel (free tier)
- **Backend**: Render (free tier)
- **Database**: Supabase (free tier) or Render (includes PostgreSQL on paid tier)
- **AI APIs**: Groq (free) or OpenAI (free credits available)

## Prerequisites

- GitHub account
- Vercel account (free)
- Render account (free)
- Supabase account (free, optional)

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub

```bash
cd ai-resume-creator
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 1.2 Verify .env.example files

Make sure you have `.env.example` files with all required variables (never commit actual `.env` files).

## Step 2: Deploy Backend to Render

### 2.1 Create New Web Service

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository

### 2.2 Configure Build Settings

**Settings:**
- **Name**: `ai-resume-creator-backend`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 2.3 Add Environment Variables

Click "Environment" and add:

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key

GROQ_MODEL=llama-3.1-70b-versatile
OPENAI_MODEL=gpt-3.5-turbo

CORS_ORIGINS=https://your-frontend-url.vercel.app

ENVIRONMENT=production
```

### 2.4 Deploy

Click "Create Web Service" to start deployment.

**Note:** For free tier, Render provides PostgreSQL. If you prefer Supabase, see next section.

## Step 3: Set Up Database

### Option A: Use Supabase (Recommended for Production)

1. Go to https://supabase.com
2. Create new project
3. Wait for setup to complete
4. Go to Settings → Database
5. Copy "Connection string (URI)"
6. Update `DATABASE_URL` in Render environment variables

**Database Setup:**
Since Supabase uses different connection format, update `app/database.py`:

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Handle different database URLs
connect_args = {}
if settings.DATABASE_URL.startswith("postgres"):
    # Remove ?sslmode=require if present and add it to connect_args
    connect_args = {"sslmode": "require"}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
```

### Option B: Use Render PostgreSQL

1. In Render dashboard, create new PostgreSQL instance
2. Connect to your web service
3. Copy internal database URL
4. Use it in `DATABASE_URL`

### 3.1 Initialize Database

After deployment, SSH into Render instance or add a one-time task:

```bash
cd backend && python init_db.py
```

Or create a task in Render:
- Build command: `pip install -r requirements.txt`
- Start command: `python init_db.py`

## Step 4: Deploy Frontend to Vercel

### 4.1 Import Project

1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the repository

### 4.2 Configure Project

**Settings:**
- **Framework Preset**: Create React App
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`

### 4.3 Add Environment Variables

Click "Environment Variables" and add:

```
REACT_APP_API_URL=https://your-backend-name.onrender.com
```

### 4.4 Deploy

Click "Deploy" to start deployment.

## Step 5: Update CORS Settings

After frontend is deployed:

1. Get your Vercel deployment URL
2. Go to Render → Your Web Service → Environment
3. Update `CORS_ORIGINS`:

```
CORS_ORIGINS=https://your-frontend.vercel.app
```

4. Restart the Render service

## Step 6: Get API Keys

### 6.1 Groq API Key (Free)

1. Go to https://console.groq.com/
2. Sign up or log in
3. Go to API Keys
4. Create new API key
5. Add to Render environment variables

### 6.2 OpenAI API Key (Optional)

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys
4. Create new secret key
5. Add to Render environment variables
6. Add credits to your account

## Step 7: Verify Deployment

### Test Backend

```bash
curl https://your-backend.onrender.com/health
```

Should return:
```json
{"status": "healthy"}
```

### Test Frontend

1. Open https://your-frontend.vercel.app
2. Try to sign up
3. Create a resume
4. Download it

## Troubleshooting

### Backend Won't Start

**Check Render logs:**
1. Go to Render dashboard
2. Click on your service
3. View "Logs" tab
4. Look for errors

**Common issues:**
- Missing environment variables
- Database connection errors
- Port configuration issues

### Frontend Can't Connect to Backend

**Check:**
1. `REACT_APP_API_URL` is set correctly in Vercel
2. CORS is configured in backend
3. Backend is running
4. No CORS errors in browser console

### Database Connection Failed

**For Supabase:**
1. Check if connection string includes SSL mode
2. Verify database is publicly accessible
3. Check firewall settings

**For Render PostgreSQL:**
1. Verify internal database URL
2. Check service dependencies are set
3. Wait for full initialization

### AI Generation Fails

**Check:**
1. API keys are correct
2. You have available API credits
3. Backend can reach AI services
4. Check backend logs for specific errors

## Security Best Practices

### 1. Environment Variables

- Never commit `.env` files
- Use environment variables for all secrets
- Rotate API keys regularly

### 2. Database Security

- Use strong passwords
- Enable SSL connections
- Restrict database access

### 3. API Security

- Use HTTPS only
- Implement rate limiting (upgrade Render plan for this)
- Validate all inputs

### 4. JWT Security

- Use strong `SECRET_KEY`
- Set reasonable token expiration
- Implement refresh tokens

## Monitoring

### Render Monitoring

- View logs in Render dashboard
- Set up alerts for service failures
- Monitor resource usage

### Vercel Monitoring

- View deployment logs
- Monitor build times
- Check analytics

## Scaling Considerations

When your app grows:

### Free Tier Limitations

- **Render**: 750 hours/month free (enough for 1 service)
- **Vercel**: 100GB bandwidth/month
- **Supabase**: 500MB database, 2GB bandwidth

### Upgrade Path

1. Monitor usage
2. Upgrade to paid tiers as needed
3. Consider dedicated hosting
4. Implement caching
5. Optimize database queries

## Maintenance

### Regular Tasks

1. Update dependencies
2. Monitor API usage
3. Backup database
4. Review logs
5. Test deployments

### Backup Strategy

For production:
1. Set up automated database backups
2. Keep code in version control
3. Document configuration
4. Have rollback plan

## Support Resources

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Groq Docs: https://console.groq.com/docs
- OpenAI Docs: https://platform.openai.com/docs

## Cost Estimate

**Free Tier:**
- Render: $0/month
- Vercel: $0/month
- Supabase: $0/month
- Groq: $0/month

**Total: $0/month**

**If you exceed free limits:**
- Render: ~$7/month
- Vercel: ~$20/month
- Supabase: ~$25/month

**Total: ~$52/month**


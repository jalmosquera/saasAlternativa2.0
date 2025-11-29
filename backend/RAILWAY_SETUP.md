# Railway Deployment Setup

## Required Environment Variables

Configure these environment variables in your Railway project settings:

### Critical (Required)
```
SECRET_KEY=<generate-a-secure-key>
```
Generate a secure key with:
```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

### Database (Auto-configured by Railway)
```
DATABASE_URL=<automatically-set-by-railway-postgres>
```
If you add a PostgreSQL database to your Railway project, this will be automatically set.

### Cloudinary (Required for media files)
```
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

### Email Configuration (Brevo)
```
BREVO_API_KEY=<your-brevo-api-key>
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
EMAIL_HOST_USER=<your-smtp-user>
EMAIL_HOST_PASSWORD=<your-smtp-password>
```

### Application Settings
```
DEBUG=False
ALLOWED_HOSTS=.railway.app,yourdomain.com
```

### CORS Configuration
```
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://*.railway.app
FRONTEND_URL=https://yourdomain.com
```

### Redis (Optional - for WebSocket support)
```
REDIS_URL=<redis-connection-string>
```
Add a Redis service in Railway to get this automatically.

### Language
```
LANGUAGE_CODE=es
```

## Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Configure Railway deployment"
   git push
   ```

2. **Create a new project in Railway**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure environment variables**
   - Go to your project settings
   - Add all the required environment variables listed above

4. **Add PostgreSQL database** (recommended)
   - Click "New" in your project
   - Select "Database" > "PostgreSQL"
   - Railway will automatically set the `DATABASE_URL` variable

5. **Add Redis** (optional, for WebSocket support)
   - Click "New" in your project
   - Select "Database" > "Redis"
   - Railway will automatically set the `REDIS_URL` variable

6. **Deploy**
   - Railway will automatically detect the `Procfile` and deploy your application
   - The deployment will run migrations and collect static files automatically

## Troubleshooting

### Application crashes on startup
- Check that `SECRET_KEY` is set and is not the default value
- Verify all required environment variables are configured
- Check the deployment logs for specific error messages

### Static files not loading
- Ensure `ALLOWED_HOSTS` includes your Railway domain
- Check that WhiteNoise is properly configured (already set in production.py)

### Database connection errors

**Error: "connection to server failed: Connection refused"**

This error occurs when Django cannot connect to PostgreSQL. Common causes:

1. **PostgreSQL service is not running**
   - Go to your Railway project dashboard
   - Check if the PostgreSQL service shows as "Active" (green)
   - If it shows "Crashed" or "Stopped", click on it and check the logs
   - Restart the PostgreSQL service if needed

2. **Services are not in the same Railway project**
   - Both your Django app and PostgreSQL must be in the SAME Railway project
   - If they're in different projects, they cannot communicate via private networking
   - Solution: Create a new PostgreSQL service within the same project as your app

3. **DATABASE_URL not set or incorrect**
   - Go to your app's "Variables" tab
   - Verify `DATABASE_URL` exists and starts with `postgresql://`
   - If missing, click "Add Variable Reference" and link it to your PostgreSQL service's `DATABASE_URL`

4. **PostgreSQL service not linked to app**
   - In your app's settings, check "Service Variables"
   - You should see a reference to the PostgreSQL service
   - If not, manually add the variable reference

5. **Network timing issues**
   - The updated `start.sh` script now waits up to 60 seconds for PostgreSQL to be ready
   - If the error persists after this wait time, check the PostgreSQL service logs for errors

### CORS errors
- Update `CORS_ALLOWED_ORIGINS` with your frontend domain
- Update `CSRF_TRUSTED_ORIGINS` with your Railway domain

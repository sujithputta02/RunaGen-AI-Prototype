# Google Cloud Setup Guide

## Required: Create Your Own Service Account

Since we can't include actual credentials in the repository for security reasons, you'll need to create your own Google Cloud service account.

## Step-by-Step Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 2. Enable Required APIs
```bash
# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Enable other required APIs
gcloud services enable compute.googleapis.com
gcloud services enable storage.googleapis.com
```

### 3. Create Service Account
1. Go to IAM & Admin > Service Accounts
2. Click "Create Service Account"
3. Name: `runagen-ai-service`
4. Description: `Service account for RunaGen AI application`

### 4. Assign Permissions
Add these roles to your service account:
- `Vertex AI User`
- `AI Platform Developer`
- `Storage Object Viewer` (if using Cloud Storage)

### 5. Create and Download Key
1. Click on your service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose JSON format
5. Download the file

### 6. Setup in Project
1. Rename the downloaded file to `service-account-key.json`
2. Place it in the `project/server/` directory
3. Update your `.env` file:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
   VERTEX_PROJECT_ID=your-project-id
   ```

## Alternative: Use Application Default Credentials

If you have gcloud CLI installed:
```bash
gcloud auth application-default login
```

Then remove the `GOOGLE_APPLICATION_CREDENTIALS` line from `.env`

## Verify Setup

Test your setup by running:
```bash
cd project/server
node test-google-cloud.js
```
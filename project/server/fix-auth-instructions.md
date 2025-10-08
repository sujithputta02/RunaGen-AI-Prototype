# Google Cloud Authentication Fix

## Problem
The current service account key is showing "Invalid JWT Signature" error, which means the key is either:
1. Corrupted or expired
2. The private key has been regenerated in Google Cloud Console
3. The service account permissions have changed

## Solution Steps

### 1. Regenerate Service Account Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to IAM & Admin > Service Accounts
3. Find the service account: `vertex-rag-service@career-companion-472510.iam.gserviceaccount.com`
4. Click on the service account name
5. Go to the "Keys" tab
6. Click "Add Key" > "Create new key"
7. Choose "JSON" format
8. Download the new key file
9. Replace the current `career-companion-472510-7dd10b4d4dcb.json` file

### 2. Verify Service Account Permissions
Ensure the service account has these roles:
- Vertex AI User
- Vertex AI Service Agent
- AI Platform Developer
- Storage Object Viewer (if using Cloud Storage)

### 3. Enable Required APIs
Make sure these APIs are enabled in your project:
- Vertex AI API
- AI Platform API
- Cloud Storage API (if using)

### 4. Test Authentication
After replacing the key file, run:
```bash
node test-vertex-auth.js
```

## Alternative: Use Application Default Credentials
If you have `gcloud` CLI installed and authenticated:
```bash
gcloud auth application-default login
```
Then modify the code to use ADC instead of key file.

## Current Status
- ✅ Service account key file exists
- ✅ Project ID is correct: career-companion-472510
- ✅ Location is correct: us-central1
- ❌ JWT signature is invalid (key needs regeneration)
- ✅ Basic API endpoints are working (fallback mode)

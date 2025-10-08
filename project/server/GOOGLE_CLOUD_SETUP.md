# 🔧 Complete Google Cloud Console Setup for RunaGen AI + RAG

## Step 1: Enable Required APIs

Go to **APIs & Services** → **Library** and enable these APIs:

### Core AI APIs
- ✅ **Vertex AI API** - For AI generation
- ✅ **Cloud Resource Manager API** - For project access

### RAG Service APIs
- ✅ **Cloud Storage API** - For file storage and document management
- ✅ **Cloud Translation API** - For multilingual text processing
- ✅ **Cloud Natural Language API** - For text analysis and entity extraction
- ✅ **Cloud Document AI API** - For advanced document processing
- ✅ **Cloud Search API** - For vector search capabilities

## Step 2: Create Service Account

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Fill in:
   - **Name**: `runa-gen-ai-rag-service`
   - **ID**: `runa-gen-ai-rag-service`
   - **Description**: `Service account for RunaGen AI with RAG capabilities`

## Step 3: Assign Required Roles

Add these roles to your service account:

### Core AI Roles
- `Vertex AI User` (`roles/aiplatform.user`)
- `AI Platform Developer` (`roles/ml.developer`)

### RAG-Specific Roles
- `Storage Object Admin` (`roles/storage.objectAdmin`) - For file uploads
- `Storage Object Viewer` (`roles/storage.objectViewer`) - For file access
- `Cloud Translation API User` (`roles/cloudtranslate.user`)
- `Cloud Natural Language API User` (`roles/language.user`)
- `Document AI API User` (`roles/documentai.apiUser`)

### Additional Permissions
- `Service Account Token Creator` (`roles/iam.serviceAccountTokenCreator`)
- `Cloud SQL Client` (`roles/cloudsql.client`) - If using Cloud SQL

## Step 4: Create and Download Key

1. Click on your service account → **Keys** tab
2. **Add Key** → **Create new key** → **JSON**
3. Download the JSON file
4. Replace `career-companion-472510-7dd10b4d4dcb.json` with your new key

## Step 5: Environment Variables

Create/update your `.env` file with:

```bash
# Google Cloud Configuration
GOOGLE_APPLICATION_CREDENTIALS=./career-companion-472510-7dd10b4d4dcb.json
VERTEX_PROJECT_ID=career-companion-472510
VERTEX_LOCATION=us-central1
VERTEX_MODEL=gemini-2.0-flash-exp

# RAG Service Configuration
GOOGLE_CLOUD_PROJECT=career-companion-472510
GOOGLE_CLOUD_LOCATION=us-central1

# Alternative AI APIs (if Google Cloud fails)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/runa-gen-ai

# Server Configuration
PORT=3001
NODE_ENV=production

# File Storage
UPLOAD_DIR=./temp
MAX_FILE_SIZE=10485760

# RAG Vector Store Configuration
VECTOR_STORE_TYPE=memory
EMBEDDING_MODEL=text-embedding-005
```

## Step 6: Test the Setup

Run the test script to verify everything works:

```bash
node test-new-service-account.js
```

## Step 7: Restart Your Server

```bash
npm start
```

## Troubleshooting

### Common Issues:
1. **API Not Enabled**: Check that all required APIs are enabled
2. **Insufficient Permissions**: Verify all roles are assigned
3. **Invalid Key**: Try downloading a new JSON key
4. **Billing**: Ensure your project has billing enabled
5. **Quotas**: Check if you've hit any API quotas

### Quick Fix Commands:
```bash
# Test authentication
node test-vertex-auth.js

# Test fallback mode
node test-fallback-mode.js

# Test new service account
node test-new-service-account.js
```

## What This Enables:

✅ **AI Generation**: Resume optimization, career trajectory, mentor chat
✅ **RAG Processing**: Document analysis, vector search, knowledge retrieval
✅ **File Management**: PDF parsing, document storage, multi-format support
✅ **Advanced Features**: Translation, entity extraction, document AI
✅ **Fallback Support**: Works even if Google Cloud fails

Your RunaGen AI application will now have full AI + RAG capabilities! 🚀



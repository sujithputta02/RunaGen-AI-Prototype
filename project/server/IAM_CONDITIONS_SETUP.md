# 🔐 IAM Conditions Setup for RunaGen AI

## Basic Setup (No Conditions Needed)

For development and testing, you can skip IAM conditions and just assign the roles directly.

## Advanced Setup (With IAM Conditions)

### 1. Storage Access Conditions

**Role**: `Storage Object Admin`
**Condition**:
```
resource.name.startsWith("projects/_/buckets/runa-gen-ai-")
```

**Role**: `Storage Object Viewer`
**Condition**:
```
resource.name.startsWith("projects/_/buckets/runa-gen-ai-") ||
resource.name.startsWith("projects/_/buckets/shared-documents-")
```

### 2. Vertex AI Access Conditions

**Role**: `Vertex AI User`
**Condition**:
```
resource.name.startsWith("projects/career-companion-472510/locations/us-central1")
```

**Role**: `AI Platform Developer`
**Condition**:
```
resource.name.startsWith("projects/career-companion-472510/locations/us-central1") &&
resource.type == "aiplatform.googleapis.com/Model"
```

### 3. API Usage Conditions

**Role**: `Cloud Translation API User`
**Condition**:
```
request.time < timestamp.date(2025, 12, 31) &&
resource.name.startsWith("projects/career-companion-472510")
```

### 4. Time-based Access

**Role**: `Document AI API User`
**Condition**:
```
request.time >= timestamp.date(2025, 1, 1) &&
request.time < timestamp.date(2025, 12, 31)
```

## Step-by-Step Setup in Google Cloud Console

### Option 1: Simple Setup (Recommended for Development)

1. Go to **IAM & Admin** → **Service Accounts**
2. Click on your service account
3. Click **"Grant Access"**
4. Add roles without conditions:
   - `Vertex AI User`
   - `Storage Object Admin`
   - `Cloud Translation API User`
   - `Cloud Natural Language API User`
   - `Document AI API User`

### Option 2: Advanced Setup (With Conditions)

1. Go to **IAM & Admin** → **IAM**
2. Find your service account
3. Click the **pencil icon** to edit
4. Click **"Add Another Role"**
5. For each role, click **"Add Condition"**
6. Use the conditions above

## Security Best Practices

### 1. Principle of Least Privilege
```
Only grant the minimum permissions needed
```

### 2. Resource-Specific Access
```
Limit access to specific buckets, datasets, or models
```

### 3. Time-Limited Access
```
Set expiration dates for temporary access
```

### 4. IP Restrictions (Optional)
```
request.auth.claims.email_verified == true &&
origin.ip in ['YOUR_IP_RANGE']
```

## Cost Control Conditions

### 1. API Quota Limits
```
request.quota.limit <= 1000
```

### 2. Resource Size Limits
```
request.resource.size <= 10485760  // 10MB limit
```

### 3. Daily Usage Limits
```
request.time >= timestamp.date(2025, 1, 1) &&
request.time < timestamp.date(2025, 1, 2)
```

## Testing Your IAM Setup

After setting up conditions, test with:

```bash
# Test basic AI functionality
node test-new-service-account.js

# Test RAG functionality
node test-fallback-mode.js

# Test specific API access
node test-vertex-auth.js
```

## Troubleshooting IAM Conditions

### Common Issues:
1. **Too Restrictive**: Condition blocks legitimate access
2. **Syntax Errors**: Invalid condition syntax
3. **Resource Mismatch**: Condition doesn't match actual resources
4. **Time Issues**: Condition time range is incorrect

### Debug Commands:
```bash
# Check current permissions
gcloud projects get-iam-policy career-companion-472510

# Test specific permission
gcloud auth list
gcloud config get-value project
```

## Recommended Setup for RunaGen AI

### For Development:
- ✅ Use basic role assignment (no conditions)
- ✅ Full project access
- ✅ All APIs enabled

### For Production:
- 🔒 Add resource-specific conditions
- 🔒 Set time-based limits
- 🔒 Monitor usage and costs
- 🔒 Regular access reviews

## Quick Start (No Conditions)

If you want to get started quickly:

1. Go to **IAM & Admin** → **Service Accounts**
2. Click on your service account
3. Click **"Grant Access"**
4. Add these roles:
   - `Vertex AI User`
   - `Storage Object Admin`
   - `Cloud Translation API User`
   - `Cloud Natural Language API User`
   - `Document AI API User`
5. Click **"Save"**

This will give your RunaGen AI app full access to work properly! 🚀



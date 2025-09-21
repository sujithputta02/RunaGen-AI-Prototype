# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (choose the free tier)

## Step 2: Get Connection String
1. In your Atlas dashboard, click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" as driver
4. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

## Step 3: Set Environment Variable
Create a `.env` file in the server directory with:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/career-companion
MONGO_DB=career-companion
```

Replace `username` and `password` with your Atlas credentials.

## Step 4: Configure Database Access
1. In Atlas, go to "Database Access"
2. Add a new database user with read/write permissions
3. Use these credentials in your connection string

## Step 5: Configure Network Access
1. In Atlas, go to "Network Access"
2. Add your IP address or use 0.0.0.0/0 for development (not recommended for production)

## Step 6: Test Connection
The server will automatically detect the MongoDB Atlas connection and use it for conversation storage. If Atlas is not available, it will fall back to file storage.

## Current Status
- ✅ File storage fallback implemented
- ✅ MongoDB Atlas integration ready
- ✅ Automatic fallback system
- ✅ Conversation history persistence

## File Storage Location
If MongoDB Atlas is not configured, conversations are saved to:
`server/data/conversations/`

Each conversation is saved as a separate JSON file with the session ID as filename.

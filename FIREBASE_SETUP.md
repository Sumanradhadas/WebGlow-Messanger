# Firebase Setup Instructions

## ✅ Security Rules Updated!

The Firestore security rules have been **updated and improved** with better sender validation. You need to update your Firebase Console with the new rules.

### Step 1: Update Firestore Security Rules (REQUIRED)

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on **"Firestore Database"** in the left sidebar
4. Click on the **"Rules"** tab at the top
5. **Copy the entire content from the `firestore.rules` file** in this project
6. **Paste it** into the Firebase Rules editor, replacing any existing rules
7. Click **"Publish"** to save the rules

**Important Changes:**
- Messages now validate that the sender ID matches the authenticated user (prevents impersonation)
- Admin assignments are tracked properly in conversations
- Better security overall

**Note:** The rules will take effect immediately after publishing.

### Step 2: Create Composite Indexes (Required for Queries)

The app uses several queries that require composite indexes. Firebase will show you errors in the browser console with links to create these indexes automatically. 

Alternatively, create them manually:

1. Go to **Firestore Database** → **Indexes** tab
2. Click **"Add Index"**
3. Create these indexes:

**Index 1: Messages by conversation and timestamp**
- Collection ID: `messages`
- Fields to index:
  - `conversationId` (Ascending)
  - `timestamp` (Ascending)
- Query scope: Collection

**Index 2: Conversations by timestamp**
- Collection ID: `conversations`
- Fields to index:
  - `lastMessageTimestamp` (Descending)
- Query scope: Collection

**Index 3: Unread messages**
- Collection ID: `messages`
- Fields to index:
  - `conversationId` (Ascending)
  - `isRead` (Ascending)
- Query scope: Collection

### Step 3: Admin Access Setup

**Important:** There is no separate admin password. Admin access is determined by your email address.

**To become an admin:**
1. Sign up with an email that **contains "admin"** in it
   - Examples: `admin@yourdomain.com`, `myadmin@gmail.com`, `admin123@example.com`
2. The app automatically assigns the "admin" role to any user whose email includes "admin"

**To use the app as a client:**
1. Sign up with any email that **doesn't contain "admin"**
   - Examples: `john@example.com`, `customer@gmail.com`

### Step 4: GitHub Media Storage

File attachments are stored in your GitHub repository using the GitHub API. Make sure:
- Your `GITHUB_PAT` has proper permissions to write to the repository
- The repository exists and is accessible
- You can create a `media/` folder in the repo (will be created automatically on first upload)

### Testing After Setup

1. **Create an admin account**: Sign up with email like `admin@test.com`
2. **Create a client account**: Sign up with email like `client@test.com`
3. **Test messaging**: Log in as client, send a message
4. **View admin panel**: Log in as admin, you should see the client's conversation
5. **Test attachments**: Upload an image or file to verify GitHub storage works

### Troubleshooting

**"Missing or insufficient permissions" error:**
- This means Firestore rules aren't published yet
- Go back to Step 1 and make sure you clicked "Publish"

**"Index required" error:**
- Click the link in the browser console error
- It will take you directly to create the required index
- Wait 1-2 minutes for the index to build

**Can't access admin panel:**
- Make sure your email contains "admin"
- Sign out and sign in again after changing the email

**Attachments not uploading:**
- Check that your GitHub PAT is valid
- Make sure the repository exists
- Check browser console for specific error messages

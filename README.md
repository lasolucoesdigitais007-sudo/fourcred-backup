<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/313f890d-0103-43ce-9029-9014ab2d6c00

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and configure your Firebase service account credentials.
3. Run the app:
   `npm run dev`

## Firebase Integration

This project uses Firebase Admin for server-side Firestore access.

- Use `FIREBASE_SERVICE_ACCOUNT_PATH` to point to a local service account JSON file.
- Or use `FIREBASE_SERVICE_ACCOUNT_JSON` to pass the JSON directly.

The submission API writes the form data into Firestore under:

- `submissions` collection
- `clients` collection (indexed by P1 CPF if available)

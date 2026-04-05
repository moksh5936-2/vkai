import * as admin from "firebase-admin";

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

if (!admin.apps.length && projectId && clientEmail && privateKey) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.includes('\\n')
        ? privateKey.replace(/\\n/g, '\n')
        : privateKey,
    }),
  });
}

// Export a proxy or check-guarded instance to prevent crashes when accessing properties
export const adminAuth = admin.apps.length ? admin.auth() : null as any;
export const adminDb = admin.apps.length ? admin.firestore() : null as any;

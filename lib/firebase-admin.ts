import * as admin from "firebase-admin";

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

if (!admin.apps.length) {
  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.includes('\\n')
            ? privateKey.replace(/\\n/g, '\n')
            : privateKey,
        }),
      });
      console.log("Firebase Admin successfully initialized.");
    } catch (error) {
      console.error("Firebase Admin initialization error:", error);
    }
  } else {
    console.warn("Firebase Admin: Missing environment variables. Auth verification will fail.");
    if (!projectId) console.warn("- Missing FIREBASE_ADMIN_PROJECT_ID");
    if (!clientEmail) console.warn("- Missing FIREBASE_ADMIN_CLIENT_EMAIL");
    if (!privateKey) console.warn("- Missing FIREBASE_ADMIN_PRIVATE_KEY");
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;

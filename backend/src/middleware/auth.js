// src/middleware/auth.js
import { getAuth } from '../lib/firebase.js';

/**
 * Verifies the Firebase ID token sent by the React frontend.
 * The client should attach: Authorization: Bearer <idToken>
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const idToken = header.split('Bearer ')[1];
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    req.user = decoded;           // uid, email, custom claims, etc.
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional: restrict to admin-role users only.
 * You can set custom claims via Firebase Admin: auth.setCustomUserClaims(uid, { admin: true })
 */
export function requireAdmin(req, res, next) {
  if (!req.user?.admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

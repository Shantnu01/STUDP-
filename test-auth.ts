import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, 'frontend-admin/.env') });

const API_KEY = process.env.VITE_FIREBASE_API_KEY;

async function testAuth(email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const data = await response.json();
  if (data.error) {
    console.error(`Login failed for ${email}:`, data.error.message);
  } else {
    console.log(`Login SUCCESS for ${email}! ID Token length:`, data.idToken.length);
  }
}

async function main() {
  await testAuth('my@gmail.com', 'my@12345');
  await testAuth('admin@edusync.in', 'admin123'); // guessing admin password
  await testAuth('test@gmail.com', 'testtest');
}

main();

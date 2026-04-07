import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '.env') })

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const auth = admin.auth()

async function reset(email, password) {
  try {
    const user = await auth.getUserByEmail(email)
    await auth.updateUser(user.uid, { password })
    console.log(`Password for ${email} reset to '${password}'`)
  } catch (e: any) {
    if (e.code === 'auth/user-not-found') {
      await auth.createUser({ email, password })
      console.log(`User ${email} created with password '${password}'`)
    } else {
      console.error('Error:', e)
    }
  }
}

async function main() {
  await reset('my@gmail.com', 'my@12345')
  await reset('admin@edusync.in', 'admin123')
  process.exit(0)
}

main()

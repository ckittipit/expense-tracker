// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyD_AqtfSb-M0PmBgt-O_duVEfUT6M5jjq4',
    authDomain: 'expense-tracker-d2562.firebaseapp.com',
    projectId: 'expense-tracker-d2562',
    storageBucket: 'expense-tracker-d2562.firebasestorage.app',
    messagingSenderId: '1001243136057',
    appId: '1:1001243136057:web:54b86aa6fe0c28e5797de8',
    measurementId: 'G-ZPQNMRNY4X',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const auth = getAuth(app)
const db = getFirestore(app)

// ✅ ตั้งค่า persistence
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log('Auth persistence set to localStorage')
    })
    .catch((error) => {
        console.error('Error setting persistence:', error)
    })

export { auth, db }
export default app
export { analytics }

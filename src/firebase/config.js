import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCth1c95TTMR1s32JAhGmBPan1GaICkb4",
  authDomain: "blessingvideomeet.firebaseapp.com",
  projectId: "blessingvideomeet",
  storageBucket: "blessingvideomeet.firebasestorage.app",
  messagingSenderId: "858825222228",
  appId: "1:858825222228:web:23a4cb3f3b9ffdf222a5c1",
  measurementId: "G-PKSQZ3JTPT"
};

const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);
const auth = getAuth(app);

export { auth, firestore };
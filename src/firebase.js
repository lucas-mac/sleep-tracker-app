// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {initializeUI} from "@firebase-oss/ui-core";
import {getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyCINpTTGxORl8hmt6r3o6y42U_PcdjSJy8",
	authDomain: "sleeper-4ee9f.firebaseapp.com",
	projectId: "sleeper-4ee9f",
	storageBucket: "sleeper-4ee9f.firebasestorage.app",
	messagingSenderId: "218417377661",
	appId: "1:218417377661:web:cbcaf998bbe732d77a9c14",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const ui = initializeUI(app);
const db = getFirestore(app);
const auth = getAuth(app);

export {app, db, ui, auth};

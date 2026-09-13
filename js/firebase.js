import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyCuF22jj4KpdNkUjVpRbOToxJvWD4yUcjM",
  authDomain: "denimmanstore.firebaseapp.com",
  projectId: "denimmanstore",
  storageBucket: "denimmanstore.firebasestorage.app",
  messagingSenderId: "537185379904",
  appId: "1:537185379904:web:794a9d3baeb15cfdebe1a5"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


export {
    db,
    auth
};
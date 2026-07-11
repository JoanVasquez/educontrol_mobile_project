import type { Provider } from "@angular/core";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { environment } from "../../../environments/environment";
import { FIRESTORE_TOKEN, STORAGE_TOKEN } from "./firebase-providers";

const firebaseConfig = environment.firebase;

export function initializeFirebase() {
  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);
  const storage = getStorage(app);
  const auth = getAuth(app);

  return { app, firestore, storage, auth };
}

export function provideFirebase(): Provider[] {
  const { firestore, storage } = initializeFirebase();

  return [
    {
      provide: FIRESTORE_TOKEN,
      useValue: firestore,
    },
    {
      provide: STORAGE_TOKEN,
      useValue: storage,
    },
  ];
}

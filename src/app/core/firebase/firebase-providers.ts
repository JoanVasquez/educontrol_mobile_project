import { InjectionToken } from '@angular/core';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

/**
 * Firebase Injection Tokens and Providers
 * Implements Dependency Injection pattern for Firebase services
 */

export const FIRESTORE_TOKEN = new InjectionToken<Firestore>('Firestore');
export const STORAGE_TOKEN = new InjectionToken<FirebaseStorage>('Storage');

/**
 * Setup Firebase services in providers array
 *
 * Example usage in app.config.ts:
 *
 * import { initializeApp } from 'firebase/app';
 * import { getFirestore } from 'firebase/firestore';
 * import { getStorage } from 'firebase/storage';
 * import { FIRESTORE_TOKEN, STORAGE_TOKEN } from './core/firebase/firebase-providers';
 *
 * const firebaseApp = initializeApp(firebaseConfig);
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     {
 *       provide: FIRESTORE_TOKEN,
 *       useValue: getFirestore(firebaseApp),
 *     },
 *     {
 *       provide: STORAGE_TOKEN,
 *       useValue: getStorage(firebaseApp),
 *     },
 *   ],
 * };
 */

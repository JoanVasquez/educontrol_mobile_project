export interface FirestoreValue {
  stringValue?: string;
  timestampValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
}

export interface FirestoreDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
}

export interface FirestoreListResponse {
  documents?: FirestoreDocument[];
}

/**
 * Domain Model for Breakdown/Averia.
 * The photo is stored as a compressed Data URL in Firestore to avoid Firebase Storage.
 */
export interface Breakdown {
  id?: string;
  category: BreakdownCategory;
  description: string;
  priority: Priority;
  location: string;
  photoUrl: string | null;
  photoDataUrl: string | null;
  photoName: string | null;
  photoContentType: string | null;
  status: BreakdownStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface BreakdownDTO {
  category: string;
  description: string;
  priority: string;
  location: string;
  photoUrl?: string | null;
  photoDataUrl?: string | null;
  photoName?: string | null;
  photoContentType?: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BreakdownPhotoEvidence {
  dataUrl: string;
  name: string;
  contentType: string;
}

export type BreakdownCategory =
  | 'Electricidad'
  | 'Plomería'
  | 'Mobiliario'
  | 'Climatización'
  | 'Tecnología'
  | 'Otra';

export type Priority = 'low' | 'medium' | 'high';

export type BreakdownStatus = 'pending' | 'in-progress' | 'resolved';

export function createBreakdown(
  category: BreakdownCategory,
  description: string,
  priority: Priority,
  location: string,
  photoDataUrl: string | null = null,
): Breakdown {
  return {
    category,
    description,
    priority,
    location,
    photoUrl: null,
    photoDataUrl,
    photoName: null,
    photoContentType: null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

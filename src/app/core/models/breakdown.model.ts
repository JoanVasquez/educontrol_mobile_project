/**
 * Domain Model for Breakdown/Averia.
 * Evidence media is stored as compact Data URLs in Firestore for the academic prototype.
 * Large production videos should be moved to Firebase Storage.
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
  videoDataUrl: string | null;
  videoName: string | null;
  videoContentType: string | null;
  status: BreakdownStatus;
  notes: string | null;
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
  videoDataUrl?: string | null;
  videoName?: string | null;
  videoContentType?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface BreakdownPhotoEvidence {
  dataUrl: string;
  name: string;
  contentType: string;
}

export interface BreakdownVideoEvidence {
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
    videoDataUrl: null,
    videoName: null,
    videoContentType: null,
    status: 'pending',
    notes: null,
    createdAt: new Date().toISOString(),
  };
}

import type { Breakdown, BreakdownDTO } from '../models/breakdown.model';

export interface FirestoreValue {
  stringValue?: string;
  timestampValue?: string;
  nullValue?: 'NULL_VALUE';
}

export interface FirestoreBreakdownPayload {
  fields: Record<keyof BreakdownDTO, FirestoreValue>;
}

export interface FirestoreDocumentResponse {
  name: string;
  fields?: Partial<Record<keyof BreakdownDTO, FirestoreValue>>;
}

export class FirestoreBreakdownMapper {
  fromDocument(document: FirestoreDocumentResponse): Breakdown {
    const fields = document.fields || {};

    return {
      id: document.name.split('/').pop(),
      category: String(fields.category?.stringValue || 'Otra') as Breakdown['category'],
      description: String(fields.description?.stringValue || ''),
      priority: String(fields.priority?.stringValue || 'low') as Breakdown['priority'],
      location: String(fields.location?.stringValue || ''),
      photoUrl: fields.photoUrl?.stringValue || null,
      photoDataUrl: fields.photoDataUrl?.stringValue || null,
      photoName: fields.photoName?.stringValue || null,
      photoContentType: fields.photoContentType?.stringValue || null,
      videoDataUrl: fields.videoDataUrl?.stringValue || null,
      videoName: fields.videoName?.stringValue || null,
      videoContentType: fields.videoContentType?.stringValue || null,
      status: String(fields.status?.stringValue || 'pending') as Breakdown['status'],
      notes: fields.notes?.stringValue || null,
      createdAt: String(fields.createdAt?.timestampValue || new Date().toISOString()),
      updatedAt: fields.updatedAt?.timestampValue,
    };
  }

  toPayload(breakdown: Breakdown): FirestoreBreakdownPayload {
    return {
      fields: {
        category: { stringValue: breakdown.category },
        description: { stringValue: breakdown.description },
        priority: { stringValue: breakdown.priority },
        location: { stringValue: breakdown.location },
        photoUrl: this.nullableString(breakdown.photoUrl),
        photoDataUrl: this.nullableString(breakdown.photoDataUrl),
        photoName: this.nullableString(breakdown.photoName),
        photoContentType: this.nullableString(breakdown.photoContentType),
        videoDataUrl: this.nullableString(breakdown.videoDataUrl),
        videoName: this.nullableString(breakdown.videoName),
        videoContentType: this.nullableString(breakdown.videoContentType),
        status: { stringValue: breakdown.status },
        notes: this.nullableString(breakdown.notes),
        createdAt: { timestampValue: breakdown.createdAt },
        updatedAt: { timestampValue: breakdown.updatedAt || breakdown.createdAt },
      },
    };
  }

  private nullableString(value: string | null | undefined): FirestoreValue {
    return value ? { stringValue: value } : { nullValue: 'NULL_VALUE' };
  }
}

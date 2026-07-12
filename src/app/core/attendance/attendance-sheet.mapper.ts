import type { FirestoreDocument, FirestoreValue } from './attendance-firestore.model';
import type { AttendanceRecord, AttendanceSheet } from './attendance.model';

export class AttendanceSheetMapper {
  fromDocument(document: FirestoreDocument): AttendanceSheet {
    const fields = document.fields ?? {};

    return {
      id: document.name.split('/').pop() ?? '',
      course: this.string(fields, 'course'),
      subject: this.string(fields, 'subject'),
      date: this.string(fields, 'date'),
      records: (fields['records']?.arrayValue?.values ?? []).map((value) => this.record(value)),
      createdBy: this.string(fields, 'createdBy'),
      createdAt: fields['createdAt']?.timestampValue ?? '',
      updatedAt: fields['updatedAt']?.timestampValue ?? '',
    };
  }

  toPayload(sheet: AttendanceSheet): { fields: Record<string, FirestoreValue> } {
    return {
      fields: {
        course: { stringValue: sheet.course },
        subject: { stringValue: sheet.subject },
        date: { stringValue: sheet.date },
        records: {
          arrayValue: {
            values: sheet.records.map((record) => ({
              mapValue: {
                fields: {
                  studentId: { stringValue: record.studentId },
                  studentName: { stringValue: record.studentName },
                  status: { stringValue: record.status },
                },
              },
            })),
          },
        },
        createdBy: { stringValue: sheet.createdBy },
        createdAt: { timestampValue: sheet.createdAt },
        updatedAt: { timestampValue: sheet.updatedAt },
      },
    };
  }

  private record(value: FirestoreValue): AttendanceRecord {
    const fields = value.mapValue?.fields ?? {};
    const status = fields['status']?.stringValue;

    return {
      studentId: fields['studentId']?.stringValue ?? '',
      studentName: fields['studentName']?.stringValue ?? '',
      status: status === 'absent' || status === 'excused' ? status : 'present',
    };
  }

  private string(fields: Record<string, FirestoreValue>, key: string): string {
    return fields[key]?.stringValue?.trim() ?? '';
  }
}

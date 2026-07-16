export const APP_STORAGE_KEYS = {
  pendingAttendanceSheets: 'educontrol.pending.attendance-sheets',
  pendingBreakdownRegistrations: 'educontrol.pending.breakdown-registrations',
  localSyncDeviceId: 'educontrol.local-sync.device-id',
} as const;

export const APP_STORAGE_KEY_LIST = Object.values(APP_STORAGE_KEYS);

export const backupSchedule = {
  full: {
    frequency: 'weekly' as const,
    timeOfDay: '02:00',
    dayOfWeek: 0 // Sunday
  },
  incremental: {
    frequency: 'daily' as const,
    timeOfDay: '01:00'
  }
}; 
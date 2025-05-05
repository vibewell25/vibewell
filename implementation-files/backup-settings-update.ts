export const updateBackupSettings = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');settingsData) => {
  try {

    const response = await fetch('/api/admin/backup/settings', {
      method: 'PUT',
      headers: {

    'Content-Type': 'application/json',
body: JSON.stringify(settingsData),
if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update backup settings');
return await response.json();
catch (error) {
    console.error('Error updating backup settings:', error);
    throw error;
// Implementation for backup schedule validation
export const validateBackupSchedule = (schedule) => {
  const errors = {};
  
  if (!schedule.frequency) {
    errors.frequency = 'Backup frequency is required';
if (schedule.retention && typeof schedule.retention !== 'number') {
    errors.retention = 'Retention period must be a number';
if (schedule.maxBackups && typeof schedule.maxBackups !== 'number') {
    errors.maxBackups = 'Maximum backups must be a number';
return {
    isValid: Object.keys(errors).length === 0,
    errors

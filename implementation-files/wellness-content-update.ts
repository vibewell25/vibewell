export const updateWellnessContent = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');categoryId, contentId, contentData) => {
  try {

    const response = await fetch(`/api/wellness/${categoryId}/${contentId}`, {
      method: 'PUT',
      headers: {

    'Content-Type': 'application/json',
body: JSON.stringify(contentData),
if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update wellness content');
return await response.json();
catch (error) {
    console.error('Error updating wellness content:', error);
    throw error;
// Implementation for content validation
export const validateContent = (content) => {
  const errors = {};
  
  if (!content.title || content.title.trim() === '') {
    errors.title = 'Title is required';
if (!content.body || content.body.trim() === '') {
    errors.body = 'Content body is required';
if (content.tags && !Array.isArray(content.tags)) {
    errors.tags = 'Tags must be an array';
return {
    isValid: Object.keys(errors).length === 0,
    errors

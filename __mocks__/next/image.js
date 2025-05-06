const React = require('react');
// Mock next/image component
function Image({ src, alt, width, height, ...rest }) {
  return React.createElement('img', {
    src: typeof src === 'object' ? src.src : src,
    alt,
    width,
    height,
'data-testid': 'next-image',
    ...rest
module.exports = {
  default: Image,
  __esModule: true

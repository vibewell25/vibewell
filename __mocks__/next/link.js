const React = require('react');
// Mock next/link component
function Link({ href, children, ...rest }) {
  return React.createElement(
    'a',
    {
      href: typeof href === 'object' ? href.pathname : href,
'data-testid': 'next-link',
      ...rest
children
module.exports = {
  default: Link,
  __esModule: true

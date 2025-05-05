const userEventMock = () => {
  return {
    // Basic interactions
    click: jest.fn().mockImplementation(() => Promise.resolve()),
    dblClick: jest.fn().mockImplementation(() => Promise.resolve()),
    tripleClick: jest.fn().mockImplementation(() => Promise.resolve()),
    hover: jest.fn().mockImplementation(() => Promise.resolve()),
    unhover: jest.fn().mockImplementation(() => Promise.resolve()),
    
    // Keyboard interactions
    tab: jest.fn().mockImplementation(({ shift } = {}) => Promise.resolve()),
    keyboard: jest.fn().mockImplementation((text) => Promise.resolve()),
    type: jest.fn().mockImplementation((element, text, options) => Promise.resolve()),
    clear: jest.fn().mockImplementation((element) => Promise.resolve()),
    
    // Form interactions
    selectOptions: jest.fn().mockImplementation((element, values) => Promise.resolve()),
    deselectOptions: jest.fn().mockImplementation((element, values) => Promise.resolve()),
    upload: jest.fn().mockImplementation((element, files) => Promise.resolve()),
    
    // Clipboard interactions
    copy: jest.fn().mockImplementation(() => Promise.resolve()),
    cut: jest.fn().mockImplementation(() => Promise.resolve()),
    paste: jest.fn().mockImplementation((text) => Promise.resolve()),
    
    // Pointer interactions
    pointer: jest.fn().mockImplementation(([{ keys, target }]) => Promise.resolve()),
    
    // Setup methods
    setup: jest.fn().mockImplementation((options) => userEventMock()),
    
    // Special interactions for elements
    selectFile: jest.fn().mockImplementation((element, files) => Promise.resolve()),
    
    // Utility methods for testing
    isPointerMovementEvent: jest.fn().mockReturnValue(false),
    isPointerDownEvent: jest.fn().mockReturnValue(false),
    isPointerUpEvent: jest.fn().mockReturnValue(false)
// Export as both default export and named export to handle different import styles
const setup = (options) => userEventMock();

module.exports = {
  __esModule: true,
  default: userEventMock,
  setup

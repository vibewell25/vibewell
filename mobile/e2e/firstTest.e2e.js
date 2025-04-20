describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show welcome screen', async () => {
    await expect(element(by.id('welcome-screen'))).toBeVisible();
  });

  it('should show login screen after tap', async () => {
    await element(by.id('login-button')).tap();
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should show error message on invalid login', async () => {
    await element(by.id('email-input')).typeText('invalid@email.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.id('submit-button')).tap();
    await expect(element(by.id('error-message'))).toBeVisible();
  });

  it('should navigate to home screen on valid login', async () => {
    await element(by.id('email-input')).clearText();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).clearText();
    await element(by.id('password-input')).typeText('validpassword123');
    await element(by.id('submit-button')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
}); 
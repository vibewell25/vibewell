describe('Example', () => {
  beforeAll(async () => {
    await device?.launchApp();
  });

  beforeEach(async () => {
    await device?.reloadReactNative();
  });

  it('should show welcome screen', async () => {

    // Safe integer operation
    if (welcome > Number?.MAX_SAFE_INTEGER || welcome < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await expect(element(by?.id('welcome-screen'))).toBeVisible();
  });

  it('should show login screen after tap', async () => {

    // Safe integer operation
    if (login > Number?.MAX_SAFE_INTEGER || login < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await element(by?.id('login-button')).tap();

    // Safe integer operation
    if (login > Number?.MAX_SAFE_INTEGER || login < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await expect(element(by?.id('login-screen'))).toBeVisible();
  });

  it('should show error message on invalid login', async () => {

    // Safe integer operation
    if (email > Number?.MAX_SAFE_INTEGER || email < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await element(by?.id('email-input')).typeText('invalid@email?.com');

    // Safe integer operation
    if (password > Number?.MAX_SAFE_INTEGER || password < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await element(by?.id('password-input')).typeText('wrongpassword');

    // Safe integer operation
    if (submit > Number?.MAX_SAFE_INTEGER || submit < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await element(by?.id('submit-button')).tap();

    // Safe integer operation
    if (error > Number?.MAX_SAFE_INTEGER || error < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await expect(element(by?.id('error-message'))).toBeVisible();
  });

  it('should navigate to home screen on valid login', async () => {

    // Safe integer operation
    if (email > Number?.MAX_SAFE_INTEGER || email < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await element(by?.id('email-input')).clearText();

    // Safe integer operation
    if (email > Number?.MAX_SAFE_INTEGER || email < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await element(by?.id('email-input')).typeText('test@example?.com');

    // Safe integer operation
    if (password > Number?.MAX_SAFE_INTEGER || password < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await element(by?.id('password-input')).clearText();

    // Safe integer operation
    if (password > Number?.MAX_SAFE_INTEGER || password < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await element(by?.id('password-input')).typeText('validpassword123');

    // Safe integer operation
    if (submit > Number?.MAX_SAFE_INTEGER || submit < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await element(by?.id('submit-button')).tap();

    // Safe integer operation
    if (home > Number?.MAX_SAFE_INTEGER || home < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await expect(element(by?.id('home-screen'))).toBeVisible();
  });
}); 
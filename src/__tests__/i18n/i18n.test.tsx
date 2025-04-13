import { render, screen } from '@testing-library/react/pure';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';
import { I18nextProvider } from 'react-i18next';
import '@testing-library/jest-dom';

// Test component that uses translations
const TestComponent = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
};

// Initialize i18n for tests
beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    resources: {
      en: {
        common: {
          welcome: 'Welcome to Vibewell',
          save: 'Save'
        }
      },
      es: {
        common: {
          welcome: 'Bienvenido a Vibewell',
          save: 'Guardar'
        }
      }
    }
  });
});

describe('Internationalization', () => {
  it('displays English text by default', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>
    );
    expect(screen.getByText('Welcome to Vibewell')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('changes language to Spanish', async () => {
    await i18n.changeLanguage('es');
    render(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>
    );
    expect(screen.getByText('Bienvenido a Vibewell')).toBeInTheDocument();
    expect(screen.getByText('Guardar')).toBeInTheDocument();
  }, 15000); // Increased timeout

  it('handles missing translations gracefully', async () => {
    await i18n.changeLanguage('fr'); // We haven't created French translations yet
    render(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>
    );
    // Should fall back to English
    expect(screen.getByText('Welcome to Vibewell')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  }, 15000); // Increased timeout
}); 
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { renderWithProviders } from '@/test-utils/component-testing';
import { screen } from '@testing-library/dom';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { I18nextProvider } from 'react-i18next';

// Test component that uses translations
const TestComponent = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <button>{t('common.actions.save')}</button>
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
          actions: {
            save: 'Save',
          },
        },
      },
      es: {
        common: {
          welcome: 'Bienvenido a Vibewell',
          actions: {
            save: 'Guardar',
          },
        },
      },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Disable suspense for tests
    },
  });
});

// Reset i18n instance after each test
afterEach(() => {
  i18n.changeLanguage('en');
});

describe('Internationalization', () => {
  it('displays English text by default', async () => {
    renderWithProviders(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>,
    );
    expect(screen.getByText('Welcome to Vibewell')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('changes language to Spanish', async () => {
    await i18n.changeLanguage('es');
    renderWithProviders(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>,
    );
    expect(screen.getByText('Bienvenido a Vibewell')).toBeInTheDocument();
    expect(screen.getByText('Guardar')).toBeInTheDocument();
  });

  it('handles missing translations gracefully', async () => {
    await i18n.changeLanguage('fr'); // We haven't created French translations yet
    renderWithProviders(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>,
    );
    // Should fall back to English
    expect(screen.getByText('Welcome to Vibewell')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});

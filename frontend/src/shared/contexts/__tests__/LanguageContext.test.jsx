import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../LanguageContext';

// Componente de prueba
const TestComponent = () => {
  const { language, changeLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="translation">{t('nav.home')}</span>
      <button onClick={() => changeLanguage('en')}>Change to EN</button>
    </div>
  );
};

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should provide language', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const lang = screen.getByTestId('language').textContent;
    expect(['es', 'en']).toContain(lang);
  });

  it('should change language', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const button = screen.getByText('Change to EN');
    fireEvent.click(button);

    expect(screen.getByTestId('language')).toHaveTextContent('en');
  });

  it('should translate static text', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const translation = screen.getByTestId('translation');
    expect(translation.textContent).toBeTruthy();
  });
});

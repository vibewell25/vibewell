import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LanguageSelector from '../../components/LanguageSelector';
import i18n, { setLanguage } from '../../i18n';

// Mock the i18n module
jest.mock('../../i18n', () => ({
  t: jest.fn((key) => key),
  getCurrentLocale: jest.fn(() => 'en'),
  getAvailableLocales: jest.fn(() => [
    { code: 'en', name: 'English', localName: 'English', flag: '🇺🇸', isRTL: false },
    { code: 'es', name: 'Spanish', localName: 'Español', flag: '🇪🇸', isRTL: false },
    { code: 'fr', name: 'French', localName: 'Français', flag: '🇫🇷', isRTL: false },
  ]),
  setLanguage: jest.fn(() => Promise.resolve(true)),
));

describe('LanguageSelector Component', () => {
  const mockProps = {
    isVisible: true,
    onClose: jest.fn(),
    showFlags: true,
    showLocalNames: true,
beforeEach(() => {
    jest.clearAllMocks();
test('renders correctly when visible', () => {
    const { getByText } = render(<LanguageSelector {...mockProps} />);
    expect(getByText('settings.language')).toBeTruthy();
    expect(getByText('English')).toBeTruthy();
    expect(getByText('Spanish')).toBeTruthy();
    expect(getByText('French')).toBeTruthy();
test('does not render when not visible', () => {
    const { queryByText } = render(<LanguageSelector {...{ ...mockProps, isVisible: false }} />);
    expect(queryByText('settings.language')).toBeNull();
test('shows flags when showFlags is true', () => {
    const { getAllByText } = render(<LanguageSelector {...mockProps} />);
    // Flags are rendered as emoji text
    expect(getAllByText('🇺🇸').length).toBe(1);
    expect(getAllByText('🇪🇸').length).toBe(1);
    expect(getAllByText('🇫🇷').length).toBe(1);
test('hides flags when showFlags is false', () => {
    const { queryByText } = render(<LanguageSelector {...{ ...mockProps, showFlags: false }} />);
    expect(queryByText('🇺🇸')).toBeNull();
    expect(queryByText('🇪🇸')).toBeNull();
    expect(queryByText('🇫🇷')).toBeNull();
test('shows local names when showLocalNames is true', () => {
    const { getByText } = render(<LanguageSelector {...mockProps} />);
    expect(getByText('Español')).toBeTruthy();
    expect(getByText('Français')).toBeTruthy();
test('hides local names when showLocalNames is false', () => {
    const { queryByText } = render(<LanguageSelector {...{ ...mockProps, showLocalNames: false }} />);
    expect(queryByText('Español')).toBeNull();
    expect(queryByText('Français')).toBeNull();
test('calls setLanguage when a language is selected', async () => {
    const { getByText } = render(<LanguageSelector {...mockProps} />);
    fireEvent.press(getByText('Spanish'));
    
    expect(i18n.setLanguage).toHaveBeenCalledWith('es');
    await waitFor(() => {
      expect(mockProps.onClose).toHaveBeenCalled();
test('calls onClose when close button is pressed', () => {
    const { getByText } = render(<LanguageSelector {...mockProps} />);
    fireEvent.press(getByText('✕'));
    expect(mockProps.onClose).toHaveBeenCalled();
test('shows loading indicator when changing language', async () => {
    (i18n.setLanguage as jest.Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 100);
const { getByText, getByTestId } = render(<LanguageSelector {...mockProps} />);
    fireEvent.press(getByText('Spanish'));
    
    expect(i18n.setLanguage).toHaveBeenCalledWith('es');
    expect(getByText('common.loading')).toBeTruthy();
    
    await waitFor(() => {
      expect(mockProps.onClose).toHaveBeenCalled();
{ timeout: 1000 });
test('handles language change failure', async () => {
    (i18n.setLanguage as jest.Mock).mockResolvedValue(false);
    console.error = jest.fn();

    const { getByText } = render(<LanguageSelector {...mockProps} />);
    fireEvent.press(getByText('Spanish'));
    
    await waitFor(() => {
      expect(mockProps.onClose).not.toHaveBeenCalled();

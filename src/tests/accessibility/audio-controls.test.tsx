import { render, setupGlobalMocks, cleanupGlobalMocks } from '../utils/test-utils';
import { axe } from 'jest-axe';
import AudioControls from '../../components/AudioControls';

describe('AudioControls Accessibility', () => {
  const mockSoundscapes = [
    { name: 'Rain', url: '/audio/rain.mp3' },
    { name: 'Ocean Waves', url: '/audio/waves.mp3' },
  ];

  beforeAll(() => {
    setupGlobalMocks();
  });

  afterAll(() => {
    cleanupGlobalMocks();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <AudioControls soundscapes={mockSoundscapes} />
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('should have proper ARIA labels for all controls', () => {
    const { getByLabelText } = render(
      <AudioControls soundscapes={mockSoundscapes} />
    );
    
    // Check play/pause button
    expect(getByLabelText(/play|pause/i)).toBeInTheDocument();
    
    // Check stop button
    expect(getByLabelText(/stop/i)).toBeInTheDocument();
    
    // Check soundscape selector
    expect(getByLabelText(/select soundscape/i)).toBeInTheDocument();
    
    // Check volume control
    expect(getByLabelText(/volume/i)).toBeInTheDocument();
  });

  it('should have proper tab order', () => {
    const { getByLabelText } = render(
      <AudioControls soundscapes={mockSoundscapes} />
    );
    
    const elements = [
      getByLabelText(/play|pause/i),
      getByLabelText(/stop/i),
      getByLabelText(/select soundscape/i),
      getByLabelText(/volume/i),
    ];

    elements.forEach((element, index) => {
      expect(element).toHaveAttribute('tabIndex', index === 0 ? '0' : undefined);
    });
  });

  it('should announce state changes to screen readers', () => {
    const { getByLabelText } = render(
      <AudioControls soundscapes={mockSoundscapes} />
    );
    
    const playButton = getByLabelText(/play/i);
    expect(playButton).toHaveAttribute('aria-pressed', 'false');
    
    const volumeControl = getByLabelText(/volume/i);
    expect(volumeControl).toHaveAttribute('aria-valuemin', '0');
    expect(volumeControl).toHaveAttribute('aria-valuemax', '1');
    expect(volumeControl).toHaveAttribute('aria-valuenow');
  });
}); 
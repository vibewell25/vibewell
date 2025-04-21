import {
  render,
  fireEvent,
  waitFor,
  setupGlobalMocks,
  cleanupGlobalMocks,
} from '../utils/test-utils';
import { act } from 'react-dom/test-utils';
import MeditationEnvironment from '@/components/ar/MeditationEnvironment';
import { MeditationProvider } from '@/contexts/MeditationContext';
import { AudioProvider } from '@/contexts/AudioContext';
import { WebGLProvider } from '@/contexts/WebGLContext';

describe('Meditation Flow Integration', () => {
  beforeAll(() => {
    setupGlobalMocks();
  });

  afterAll(() => {
    cleanupGlobalMocks();
  });

  beforeEach(() => {
    // Reset timer mocks
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('completes full meditation session flow', async () => {
    const onStateChange = jest.fn();

    const { getByText, getByLabelText } = render(
      <MeditationEnvironment
        theme="zen-garden"
        soundscape="rain"
        lightingIntensity={0.8}
        particleEffects={true}
        onStateChange={onStateChange}
      />
    );

    // Initial state verification
    expect(getByText('Zen Garden Meditation')).toBeInTheDocument();
    expect(getByText('Begin Meditation')).toBeInTheDocument();

    // Start meditation session
    fireEvent.click(getByText('Begin Meditation'));
    expect(getByText('End Session')).toBeInTheDocument();

    // Verify timer starts
    expect(getByText('0:00')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(65000); // Advance 65 seconds
    });
    expect(getByText('1:05')).toBeInTheDocument();

    // End session
    fireEvent.click(getByText('End Session'));
    expect(getByText('Begin Meditation')).toBeInTheDocument();
  });

  it('handles meditation session interruptions', async () => {
    const onStateChange = jest.fn();

    const { getByText } = render(
      <MeditationEnvironment
        theme="zen-garden"
        soundscape="rain"
        lightingIntensity={0.8}
        particleEffects={true}
        onStateChange={onStateChange}
      />
    );

    // Start session
    fireEvent.click(getByText('Begin Meditation'));

    // Simulate page visibility change
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(getByText('Session Paused')).toBeInTheDocument();

    // Resume session
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(getByText('End Session')).toBeInTheDocument();
  });

  it('maintains meditation preferences across sessions', async () => {
    const onStateChange = jest.fn();

    const { getByText, getByLabelText, rerender } = render(
      <MeditationEnvironment
        theme="zen-garden"
        soundscape="rain"
        lightingIntensity={0.8}
        particleEffects={true}
        onStateChange={onStateChange}
      />
    );

    // Start and customize session
    fireEvent.click(getByText('Begin Meditation'));

    // Adjust settings
    const volumeSlider = getByLabelText(/volume/i);
    fireEvent.change(volumeSlider, { target: { value: '0.6' } });

    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({
        volume: 0.6,
      })
    );

    // End session
    fireEvent.click(getByText('End Session'));

    // Unmount and remount component
    rerender(<></>);
    rerender(
      <MeditationEnvironment
        theme="zen-garden"
        soundscape="rain"
        lightingIntensity={0.8}
        particleEffects={true}
        onStateChange={onStateChange}
      />
    );

    // Verify preferences maintained
    const newVolumeSlider = getByLabelText(/volume/i);
    expect(newVolumeSlider).toHaveValue('0.6');
  });

  it('handles errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock audio loading failure
    window.fetch = jest.fn().mockRejectedValue(new Error('Failed to load audio'));

    const { getByText, findByText } = render(
      <MeditationEnvironment
        theme="zen-garden"
        soundscape="rain"
        lightingIntensity={0.8}
        particleEffects={true}
        onStateChange={() => {}}
      />
    );

    fireEvent.click(getByText('Begin Meditation'));

    // Verify error message
    expect(await findByText(/Failed to load audio/)).toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('syncs WebGL scene with meditation state', async () => {
    const mockUpdateScene = jest.fn();

    const { getByLabelText } = render(
      <MeditationEnvironment
        theme="zen-garden"
        soundscape="rain"
        lightingIntensity={0.8}
        particleEffects={true}
        onStateChange={() => {}}
      />
    );

    // Adjust lighting
    const lightingSlider = getByLabelText(/lighting/i);
    fireEvent.change(lightingSlider, { target: { value: '1.0' } });

    await waitFor(() => {
      expect(mockUpdateScene).toHaveBeenCalledWith(
        expect.objectContaining({
          lightingIntensity: 1.0,
        })
      );
    });
  });
});

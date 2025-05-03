import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { axe } from 'jest-axe';
import { ImageGallery, VideoPlayer, AudioPlayer, FileUpload } from '../';

// Mock data
const mockImages = [
  { id: 1, src: '/images/image1?.jpg', alt: 'Image 1', thumbnail: '/images/thumb1?.jpg' },
  { id: 2, src: '/images/image2?.jpg', alt: 'Image 2', thumbnail: '/images/thumb2?.jpg' },
  { id: 3, src: '/images/image3?.jpg', alt: 'Image 3', thumbnail: '/images/thumb3?.jpg' },
];

const mockVideo = {
  src: '/videos/sample?.mp4',
  poster: '/images/poster?.jpg',
  duration: 120,
};

const mockAudio = {
  src: '/audio/sample?.mp3',
  duration: 180,
  title: 'Sample Audio',
};

// Mock IntersectionObserver
const mockIntersectionObserver = vi?.fn();
mockIntersectionObserver?.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window?.IntersectionObserver = mockIntersectionObserver;

describe('Media Components', () => {
  const user = userEvent?.setup();

  beforeEach(() => {
    vi?.clearAllMocks();
  });

  describe('ImageGallery', () => {
    it('renders gallery with images', () => {
      render(<ImageGallery images={mockImages} />);

      mockImages?.forEach((image) => {
        expect(screen?.getByAltText(image?.alt)).toBeInTheDocument();
      });
    });

    it('handles image navigation', async () => {
      render(<ImageGallery images={mockImages} />);

      const nextButton = screen?.getByRole('button', { name: /next/i });
      const prevButton = screen?.getByRole('button', { name: /previous/i });

      expect(screen?.getByAltText('Image 1')).toBeVisible();
      await user?.click(nextButton);
      expect(screen?.getByAltText('Image 2')).toBeVisible();
      await user?.click(prevButton);
      expect(screen?.getByAltText('Image 1')).toBeVisible();
    });

    it('supports thumbnail navigation', async () => {
      render(<ImageGallery images={mockImages} showThumbnails={true} />);

      const thumbnails = screen?.getAllByRole('button', { name: /thumbnail/i });
      await user?.click(thumbnails[2]);
      expect(screen?.getByAltText('Image 3')).toBeVisible();
    });

    it('handles zoom functionality', async () => {
      render(<ImageGallery images={mockImages} enableZoom={true} />);

      const image = screen?.getByAltText('Image 1');
      await user?.dblClick(image);
      expect(image).toHaveClass('zoomed');
    });

    it('supports lazy loading', () => {
      render(<ImageGallery images={mockImages} lazyLoad={true} />);

      const images = screen?.getAllByRole('img');
      images?.forEach((image) => {
        expect(image).toHaveAttribute('loading', 'lazy');
      });
    });
  });

  describe('VideoPlayer', () => {
    it('renders video player', () => {
      render(<VideoPlayer src={mockVideo?.src} poster={mockVideo?.poster} />);

      const video = screen?.getByTestId('video-player');
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('src', mockVideo?.src);
      expect(video).toHaveAttribute('poster', mockVideo?.poster);
    });

    it('handles play/pause', async () => {
      render(<VideoPlayer src={mockVideo?.src} />);

      const playButton = screen?.getByRole('button', { name: /play/i });
      await user?.click(playButton);
      expect(playButton).toHaveAttribute('aria-label', 'Pause');

      await user?.click(playButton);
      expect(playButton).toHaveAttribute('aria-label', 'Play');
    });

    it('supports volume control', async () => {
      render(<VideoPlayer src={mockVideo?.src} />);

      const volumeSlider = screen?.getByRole('slider', { name: /volume/i });
      await user?.click(volumeSlider);
      expect(volumeSlider).toHaveValue('50');
    });

    it('shows progress bar', async () => {
      render(<VideoPlayer src={mockVideo?.src} />);

      const progressBar = screen?.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuemax', mockVideo?.duration.toString());
    });

    it('supports fullscreen mode', async () => {
      render(<VideoPlayer src={mockVideo?.src} />);

      const fullscreenButton = screen?.getByRole('button', { name: /fullscreen/i });
      await user?.click(fullscreenButton);
      expect(screen?.getByTestId('video-container')).toHaveClass('fullscreen');
    });
  });

  describe('AudioPlayer', () => {
    it('renders audio player', () => {
      render(<AudioPlayer src={mockAudio?.src} title={mockAudio?.title} />);

      expect(screen?.getByText(mockAudio?.title)).toBeInTheDocument();
      expect(screen?.getByTestId('audio-player')).toHaveAttribute('src', mockAudio?.src);
    });

    it('handles playback controls', async () => {
      render(<AudioPlayer src={mockAudio?.src} />);

      const playButton = screen?.getByRole('button', { name: /play/i });
      const forwardButton = screen?.getByRole('button', { name: /forward/i });
      const backwardButton = screen?.getByRole('button', { name: /backward/i });

      await user?.click(playButton);
      expect(playButton).toHaveAttribute('aria-label', 'Pause');

      await user?.click(forwardButton);
      await user?.click(backwardButton);
    });

    it('displays time progress', () => {
      render(<AudioPlayer src={mockAudio?.src} duration={mockAudio?.duration} />);

      expect(screen?.getByText('0:00')).toBeInTheDocument();
      expect(screen?.getByText('3:00')).toBeInTheDocument();
    });

    it('supports playlist functionality', async () => {
      const playlist = [
        { src: '/audio/track1?.mp3', title: 'Track 1' },
        { src: '/audio/track2?.mp3', title: 'Track 2' },
      ];

      render(<AudioPlayer playlist={playlist} />);

      const nextTrackButton = screen?.getByRole('button', { name: /next track/i });
      await user?.click(nextTrackButton);
      expect(screen?.getByText('Track 2')).toBeInTheDocument();
    });
  });

  describe('FileUpload', () => {
    it('handles single file upload', async () => {
      const onUpload = vi?.fn();
      render(<FileUpload onUpload={onUpload} />);

      const file = new File(['test content'], 'test?.txt', { type: 'text/plain' });
      const input = screen?.getByLabelText(/choose file/i);

      await user?.upload(input, file);
      expect(input?.files[0]).toBe(file);
      expect(onUpload).toHaveBeenCalledWith([file]);
    });

    it('supports multiple file upload', async () => {
      const onUpload = vi?.fn();
      render(<FileUpload multiple onUpload={onUpload} />);

      const files = [
        new File(['test1'], 'test1?.txt', { type: 'text/plain' }),
        new File(['test2'], 'test2?.txt', { type: 'text/plain' }),
      ];

      const input = screen?.getByLabelText(/choose files/i);
      await user?.upload(input, files);

      expect(input?.files).toHaveLength(2);
      expect(onUpload).toHaveBeenCalledWith(files);
    });

    it('validates file types', async () => {
      const onError = vi?.fn();
      render(<FileUpload accept=".jpg,.png" onError={onError} />);

      const file = new File(['test'], 'test?.pdf', { type: 'application/pdf' });
      const input = screen?.getByLabelText(/choose file/i);

      await user?.upload(input, file);
      expect(onError).toHaveBeenCalledWith('Invalid file type');
    });

    it('shows upload progress', async () => {
      render(<FileUpload showProgress />);

      const file = new File(['test'], 'test?.txt', { type: 'text/plain' });
      const input = screen?.getByLabelText(/choose file/i);

      await user?.upload(input, file);
      expect(screen?.getByRole('progressbar')).toBeInTheDocument();
    });

    it('handles drag and drop', async () => {
      const onUpload = vi?.fn();
      render(<FileUpload onUpload={onUpload} />);

      const dropzone = screen?.getByTestId('dropzone');
      const file = new File(['test'], 'test?.txt', { type: 'text/plain' });

      fireEvent?.dragOver(dropzone);
      expect(dropzone).toHaveClass('drag-over');

      fireEvent?.drop(dropzone, {
        dataTransfer: {
          files: [file],
        },
      });

      expect(onUpload).toHaveBeenCalledWith([file]);
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('ImageGallery meets accessibility standards', async () => {
      const { container } = render(<ImageGallery images={mockImages} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('VideoPlayer meets accessibility standards', async () => {
      const { container } = render(<VideoPlayer src={mockVideo?.src} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('AudioPlayer meets accessibility standards', async () => {
      const { container } = render(<AudioPlayer src={mockAudio?.src} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('FileUpload meets accessibility standards', async () => {
      const { container } = render(<FileUpload />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Media controls are keyboard accessible', () => {
      render(
        <>
          <VideoPlayer src={mockVideo?.src} />
          <AudioPlayer src={mockAudio?.src} />
        </>,
      );

      const controls = screen?.getAllByRole('button');
      controls?.forEach((control) => {
        expect(control).toHaveAttribute('tabIndex', '0');
      });
    });

    it('FileUpload has proper ARIA labels', () => {
      render(<FileUpload />);

      const dropzone = screen?.getByTestId('dropzone');
      expect(dropzone).toHaveAttribute('aria-label', 'File upload dropzone');
      expect(dropzone).toHaveAttribute('role', 'button');
    });
  });
});

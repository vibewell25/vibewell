import { render, screen, fireEvent } from '@testing-library/react';
import { YogaPoseEstimation } from '../YogaPoseEstimation';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

// Mock TensorFlow.js
jest.mock('@tensorflow/tfjs', () => ({
  ready: jest.fn().mockResolvedValue(undefined),
}));

// Mock pose-detection
jest.mock('@tensorflow-models/pose-detection', () => ({
  SupportedModels: {
    BlazePose: 'blazepose',
  },
  createDetector: jest.fn().mockResolvedValue({
    estimatePoses: jest.fn().mockResolvedValue([{
      keypoints: [
        { x: 0, y: 0, name: 'nose', score: 0.9 },
        { x: 100, y: 0, name: 'left_shoulder', score: 0.8 },
        { x: 200, y: 0, name: 'right_shoulder', score: 0.8 },
      ],
    }]),
  }),
}));

describe('YogaPoseEstimation', () => {
  const mockProps = {
    pose: 'warrior' as const,
    difficulty: 'beginner' as const,
    showGuideLines: true,
    onPoseUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<YogaPoseEstimation {...mockProps} />);
    
    expect(screen.getByText(/Warrior/)).toBeInTheDocument();
    expect(screen.getByText('Start Analysis')).toBeInTheDocument();
    expect(screen.getByText('Key Points:')).toBeInTheDocument();
  });

  it('initializes pose detection', async () => {
    render(<YogaPoseEstimation {...mockProps} />);
    
    expect(tf.ready).toHaveBeenCalled();
    expect(poseDetection.createDetector).toHaveBeenCalledWith(
      poseDetection.SupportedModels.BlazePose,
      expect.any(Object)
    );
  });

  it('handles start/stop analysis', () => {
    render(<YogaPoseEstimation {...mockProps} />);
    
    const button = screen.getByText('Start Analysis');
    fireEvent.click(button);
    expect(screen.getByText('Stop Analysis')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Stop Analysis'));
    expect(screen.getByText('Start Analysis')).toBeInTheDocument();
  });

  it('displays pose instructions', () => {
    render(<YogaPoseEstimation {...mockProps} />);
    
    const instructions = POSE_CONFIGS.warrior.instructions;
    instructions.forEach(instruction => {
      expect(screen.getByText(instruction)).toBeInTheDocument();
    });
  });

  it('updates pose score and feedback', async () => {
    const onPoseUpdate = jest.fn();
    render(
      <YogaPoseEstimation
        {...mockProps}
        onPoseUpdate={onPoseUpdate}
      />
    );
    
    // Start analysis
    fireEvent.click(screen.getByText('Start Analysis'));
    
    // Wait for pose estimation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(onPoseUpdate).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Array)
    );
  });

  it('handles guide lines toggle', () => {
    render(<YogaPoseEstimation {...mockProps} />);
    
    const checkbox = screen.getByRole('checkbox', { name: /Show Guide Lines/i });
    expect(checkbox).toBeChecked();
    
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('handles different poses', () => {
    const { rerender } = render(<YogaPoseEstimation {...mockProps} />);
    expect(screen.getByText(/Warrior/)).toBeInTheDocument();
    
    rerender(
      <YogaPoseEstimation
        {...mockProps}
        pose="tree"
      />
    );
    expect(screen.getByText(/Tree/)).toBeInTheDocument();
  });

  it('handles different difficulty levels', () => {
    const { rerender } = render(<YogaPoseEstimation {...mockProps} />);
    
    rerender(
      <YogaPoseEstimation
        {...mockProps}
        difficulty="advanced"
      />
    );
    
    // Verify that pose requirements are adjusted for advanced level
    const poseConfig = POSE_CONFIGS[mockProps.pose];
    Object.entries(poseConfig.angles).forEach(([joint, range]) => {
      const tolerance = difficulty === 'advanced' ? 5 : 10;
      expect(range.max - range.min).toBeLessThanOrEqual(tolerance);
    });
  });
}); 
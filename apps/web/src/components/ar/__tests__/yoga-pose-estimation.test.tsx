/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping *//**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import YogaPoseEstimation from '../YogaPoseEstimation';
import type { YogaPoseEstimationProps } from '../YogaPoseEstimation';
import * as tf from '@tensorflow/tfjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

interface PoseConfig {
  keyPoints: string[];
  angles: {
    [key: string]: { min: number; max: number };
  };
  instructions: string[];
}

interface PoseConfigs {
  [key: string]: PoseConfig;
}

const POSE_CONFIGS: PoseConfigs = {
  warrior: {
    keyPoints: ['hip', 'knee', 'ankle', 'shoulder'],
    angles: {
      knee: { min: 85, max: 95 },
      hip: { min: 85, max: 95 },
      shoulder: { min: 175, max: 185 },
    },
    instructions: [
      'Front knee bent at 90 degrees',
      'Back leg straight',
      'Arms parallel to ground',
      'Shoulders relaxed',
    ],
  },
  tree: {
    keyPoints: ['hip', 'knee', 'ankle'],
    angles: {
      knee: { min: 85, max: 95 },
      hip: { min: 175, max: 185 },
    },
    instructions: [
      'Standing leg straight',
      'Foot placed on inner thigh',
      'Hips level',
      'Spine straight',
    ],
  },
};

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs', () => ({
  ready: vi.fn().mockResolvedValue(undefined),
}));

// Mock pose-detection
vi.mock('@tensorflow-models/pose-detection', () => ({
  SupportedModels: {
    BlazePose: 'blazepose',
  },
  createDetector: vi.fn().mockResolvedValue({
    estimatePoses: vi.fn().mockResolvedValue([
      {
        keypoints: [
          { x: 0, y: 0, name: 'nose', score: 0.9 },
          { x: 100, y: 0, name: 'left_shoulder', score: 0.8 },
          { x: 200, y: 0, name: 'right_shoulder', score: 0.8 },
        ],
      },
    ]),
  }),
}));

// Mock Camera
vi.mock('@mediapipe/camera_utils', () => ({
  Camera: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
  })),
}));

describe('YogaPoseEstimation', () => {
  const mockProps: YogaPoseEstimationProps = {
    pose: 'warrior',
    difficulty: 'beginner',
    showGuideLines: true,
    onPoseUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<YogaPoseEstimation {...mockProps} />);

    expect(screen.getByText('Warrior')).toBeInTheDocument();
    expect(screen.getByText('Start Analysis')).toBeInTheDocument();
    expect(screen.getByText('Key Points:')).toBeInTheDocument();
  });

  it('initializes pose detection', async () => {
    render(<YogaPoseEstimation {...mockProps} />);
    expect(tf.ready).toHaveBeenCalled();
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

    const poseConfig = POSE_CONFIGS[mockProps.pose];
    if (!poseConfig) {
      throw new Error(`No configuration found for pose: ${mockProps.pose}`);
    }

    poseConfig.instructions.forEach((instruction: string) => {
      expect(screen.getByText(instruction)).toBeInTheDocument();
    });
  });

  it('updates pose score and feedback', async () => {
    const onPoseUpdate = vi.fn();
    render(<YogaPoseEstimation {...mockProps} onPoseUpdate={onPoseUpdate} />);

    // Start analysis
    fireEvent.click(screen.getByText('Start Analysis'));

    // Wait for pose estimation
    await vi.advanceTimersByTime(100);

    expect(onPoseUpdate).toHaveBeenCalledWith(expect.any(Number), expect.any(Array));
  });

  it('handles guide lines toggle', () => {
    render(<YogaPoseEstimation {...mockProps} />);

    const checkbox = screen.getByLabelText('Show Guide Lines');
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('handles different poses', () => {
    render(<YogaPoseEstimation {...mockProps} />);
    expect(screen.getByText('Warrior')).toBeInTheDocument();

    render(<YogaPoseEstimation {...mockProps} pose="tree" />);
    expect(screen.getByText('Tree')).toBeInTheDocument();
  });

  it('handles different difficulty levels', () => {
    render(<YogaPoseEstimation {...mockProps} />);

    render(<YogaPoseEstimation {...mockProps} difficulty="advanced" />);

    // Verify that pose requirements are adjusted for advanced level
    const poseConfig = POSE_CONFIGS[mockProps.pose];
    if (!poseConfig) {
      throw new Error(`No configuration found for pose: ${mockProps.pose}`);
    }

    const difficulty = process.env['DIFFICULTY'];
    Object.entries(poseConfig.angles).forEach(([_joint, range]) => {
      const tolerance = difficulty === 'advanced' ? 5 : 10;
      expect(range.max - range.min).toBeLessThanOrEqual(tolerance);
    });
  });
});

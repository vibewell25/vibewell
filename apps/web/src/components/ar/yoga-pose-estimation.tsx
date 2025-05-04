import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Camera } from '@mediapipe/camera_utils';

export interface YogaPoseEstimationProps {
  pose: 'warrior' | 'tree' | 'downward-dog' | 'cobra' | 'child';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  showGuideLines?: boolean;
  onPoseUpdate?: (score: number, feedback: string[]) => void;
}

const POSE_CONFIGS = {
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
  'downward-dog': {
    keyPoints: ['shoulder', 'hip', 'ankle', 'wrist'],
    angles: {
      shoulder: { min: 170, max: 190 },
      hip: { min: 85, max: 95 },
    },
    instructions: [
      'Arms and legs straight',
      'Hips high',
      'Heels reaching toward ground',
      'Head relaxed',
    ],
  },
  cobra: {
    keyPoints: ['shoulder', 'hip', 'chest'],
    angles: {
      shoulder: { min: 85, max: 95 },
      hip: { min: 170, max: 190 },
    },
    instructions: ['Lower body on ground', 'Arms slightly bent', 'Chest lifted', 'Shoulders down'],
  },
  child: {
    keyPoints: ['hip', 'knee', 'ankle'],
    angles: {
      hip: { min: 45, max: 65 },
      knee: { min: 85, max: 95 },
    },
    instructions: ['Sitting on heels', 'Forehead on ground', 'Arms extended', 'Shoulders relaxed'],
  },
};

const YogaPoseEstimation: React.FC<YogaPoseEstimationProps> = ({
  pose,
  difficulty,
  showGuideLines = true,
  onPoseUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [poseScore, setPoseScore] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);

  useEffect(() => {
    const initializePoseDetection = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
      await tf.ready();
      const model = poseDetection.SupportedModels.BlazePose;
      const detectorConfig = {
        runtime: 'tfjs',
        modelType: 'full',
        enableSmoothing: true,
      };
      const detector = await poseDetection.createDetector(model, detectorConfig);
      setDetector(detector);
    };

    initializePoseDetection();
  }, []);

  useEffect(() => {
    if (!videoRef.current || !detector || !isAnalyzing) return;

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (!detector || !videoRef.current || !canvasRef.current) return;

        const poses = await detector.estimatePoses(videoRef.current, {
          flipHorizontal: false,
        });

        if (poses.length > 0) {
          const pose = poses[0];
          analyzePose(pose);
          drawPoseAndGuides(pose);
        }
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
    };
  }, [detector, isAnalyzing, pose]);

  const analyzePose = (detectedPose: poseDetection.Pose) => {
    const config = POSE_CONFIGS[pose];
    const newFeedback: string[] = [];
    let score = 0;

    // Analyze each key point and angle
    config.keyPoints.forEach((point) => {
      const angle = calculateAngle(detectedPose, point);
      const target = config.angles[point as keyof typeof config.angles];

      if (angle < target.min) {
        newFeedback.push(`Increase ${point} angle`);
      } else if (angle > target.max) {
        newFeedback.push(`Decrease ${point} angle`);
      } else {
        if (score > Number.MAX_SAFE_INTEGER || score < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); score += 1;
      }
    });

    // Calculate final score as percentage
    const finalScore = (score / config.keyPoints.length) * 100;
    setPoseScore(finalScore);
    setFeedback(newFeedback);
    onPoseUpdate.(finalScore, newFeedback);
  };

  const drawPoseAndGuides = (detectedPose: poseDetection.Pose) => {
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw detected pose
    drawKeypoints(detectedPose.keypoints, ctx);
    drawSkeleton(detectedPose.keypoints, ctx);

    if (showGuideLines) {
      drawGuideLines(ctx, pose);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="relative aspect-video">
        <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          width={640}
          height={480}
        />

        {/* Pose Score Indicator */}
        <div className="absolute right-4 top-4 rounded-lg bg-white/90 p-2 backdrop-blur-sm">
          <div className="text-lg font-semibold">Score: {poseScore.toFixed(0)}%</div>
        </div>
      </div>

      {/* Controls and Feedback */}
      <div className="mt-4 rounded-lg bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {pose
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}{' '}
            Pose
          </h3>
          <button
            className={`rounded px-4 py-2 ${isAnalyzing ? 'bg-red-500' : 'bg-primary'} text-white`}
            onClick={() => setIsAnalyzing(!isAnalyzing)}
          >
            {isAnalyzing ? 'Stop Analysis' : 'Start Analysis'}
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-4">
          <h4 className="mb-2 font-medium">Key Points:</h4>
          <ul className="list-disc space-y-1 pl-5">
            {POSE_CONFIGS[pose].instructions.map((instruction, index) => (
              <li key={index} className="text-sm">
                {instruction}
              </li>
            ))}
          </ul>
        </div>

        {/* Feedback */}
        {feedback.length > 0 && (
          <div className="rounded-lg bg-yellow-50 p-3">
            <h4 className="mb-2 font-medium">Adjustments Needed:</h4>
            <ul className="list-disc space-y-1 pl-5">
              {feedback.map((item, index) => (
                <li key={index} className="text-sm text-yellow-800">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const calculateAngle = (pose: poseDetection.Pose, joint: string): number => {
  const keypoints = pose.keypoints;

  const jointConnections: Record<string, [string, string, string]> = {
    knee: ['hip', 'knee', 'ankle'],
    hip: ['shoulder', 'hip', 'knee'],
    shoulder: ['neck', 'shoulder', 'elbow'],
    ankle: ['knee', 'ankle', 'foot'],
  };

  if (!jointConnections[joint]) return 0;

  const [p1Name, p2Name, p3Name] = jointConnections[joint];

  const p1 = keypoints.find((kp) => kp.name === p1Name);
  const p2 = keypoints.find((kp) => kp.name === p2Name);
  const p3 = keypoints.find((kp) => kp.name === p3Name);

  if (!p1.x || !p1.y || !p2.x || !p2.y || !p3.x || !p3.y) return 0;

  const angle = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);

  return Math.abs(angle * (180 / Math.PI));
};

const drawKeypoints = (keypoints: poseDetection.Keypoint[], ctx: CanvasRenderingContext2D) => {
  keypoints.forEach((keypoint) => {
    if (keypoint.score && keypoint.score > 0.3) {
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.fill();
      ctx.strokeStyle = 'rgb(0, 255, 0)';
      ctx.stroke();
    }
  });
};

const drawSkeleton = (keypoints: poseDetection.Keypoint[], ctx: CanvasRenderingContext2D) => {
  // Implementation of skeleton drawing
  // This would connect the keypoints with lines to show the body structure
};

const drawGuideLines = (ctx: CanvasRenderingContext2D, pose: string) => {
  // Implementation of ideal pose guide lines
  // This would show the target pose alignment
};

export default YogaPoseEstimation;

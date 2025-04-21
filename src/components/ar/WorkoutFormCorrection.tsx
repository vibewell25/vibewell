import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Camera } from '@mediapipe/camera_utils';
import { drawKeypoints, drawSkeleton } from '@tensorflow-models/pose-detection';

export interface WorkoutFormCorrectionProps {
  exerciseType: 'squat' | 'pushup' | 'plank' | 'warrior' | 'tree';
  onFormUpdate: (score: number, feedback: string[]) => void;
  showGuideLines?: boolean;
}

const POSE_CONFIG = {
  squat: {
    keyPoints: ['hip', 'knee', 'ankle'],
    idealAngles: { knee: 90, hip: 45 },
  },
  pushup: {
    keyPoints: ['shoulder', 'elbow', 'wrist'],
    idealAngles: { elbow: 90 },
  },
  plank: {
    keyPoints: ['shoulder', 'hip', 'ankle'],
    idealAngles: { shoulder: 180, hip: 180 },
  },
  warrior: {
    keyPoints: ['hip', 'knee', 'ankle'],
    idealAngles: { knee: 90, hip: 90 },
  },
  tree: {
    keyPoints: ['hip', 'knee', 'ankle'],
    idealAngles: { knee: 45, hip: 180 },
  },
};

const calculateAngle = (pose: poseDetection.Pose, joint: string): number => {
  const keypoints = pose.keypoints;

  // Define joint connections for angle calculation
  const jointConnections: Record<string, [string, string, string]> = {
    knee: ['hip', 'knee', 'ankle'],
    hip: ['shoulder', 'hip', 'knee'],
    elbow: ['shoulder', 'elbow', 'wrist'],
    shoulder: ['neck', 'shoulder', 'elbow'],
  };

  if (!jointConnections[joint]) {
    return 0;
  }

  const [p1Name, p2Name, p3Name] = jointConnections[joint];

  const p1 = keypoints.find(kp => kp.name === p1Name);
  const p2 = keypoints.find(kp => kp.name === p2Name);
  const p3 = keypoints.find(kp => kp.name === p3Name);

  if (!p1?.x || !p1?.y || !p2?.x || !p2?.y || !p3?.x || !p3?.y) {
    return 0;
  }

  // Calculate vectors
  const vector1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const vector2 = { x: p3.x - p2.x, y: p3.y - p2.y };

  // Calculate angle in radians
  const angle = Math.atan2(
    vector1.x * vector2.y - vector1.y * vector2.x,
    vector1.x * vector2.x + vector1.y * vector2.y
  );

  // Convert to degrees
  return Math.abs(angle * (180 / Math.PI));
};

const WorkoutFormCorrection: React.FC<WorkoutFormCorrectionProps> = ({
  exerciseType,
  onFormUpdate,
  showGuideLines = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const initializePoseDetection = async () => {
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
    if (!videoRef.current) return;

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (!detector || !videoRef.current || !canvasRef.current) return;

        const poses = await detector.estimatePoses(videoRef.current, {
          flipHorizontal: false,
        });

        if (poses.length > 0) {
          const pose = poses[0];
          const feedback = analyzeForm(pose, exerciseType);
          drawPose(pose, canvasRef.current);
          onFormUpdate(calculateFormScore(pose, exerciseType), feedback);
        }
      },
      width: 640,
      height: 480,
    });

    camera.start();
    setCamera(camera);

    return () => {
      camera.stop();
    };
  }, [detector, exerciseType]);

  const analyzeForm = (pose: poseDetection.Pose, exerciseType: string): string[] => {
    const feedback: string[] = [];
    const config = POSE_CONFIG[exerciseType as keyof typeof POSE_CONFIG];

    // Analyze pose based on exercise type
    if (exerciseType === 'squat') {
      const kneeAngle = calculateAngle(pose, 'knee');
      if (Math.abs(kneeAngle - config.idealAngles.knee) > 15) {
        feedback.push('Adjust knee angle - aim for 90 degrees');
      }
    }
    // Add more exercise-specific form analysis

    return feedback;
  };

  const calculateFormScore = (pose: poseDetection.Pose, exerciseType: string): number => {
    // Implement form scoring logic based on pose alignment with ideal form
    return 85; // Placeholder score
  };

  const drawPose = (pose: poseDetection.Pose, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showGuideLines) {
      // Draw guide lines for ideal form
      drawGuideLines(ctx, exerciseType);
    }

    // Draw detected pose
    drawKeypoints(pose.keypoints, 0.5, ctx);
    drawSkeleton(pose.keypoints, 0.5, ctx);
  };

  const drawGuideLines = (ctx: CanvasRenderingContext2D, exerciseType: string) => {
    // Implement guide line drawing based on exercise type
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 2;
    // Draw exercise-specific guide lines
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative aspect-video">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          width={640}
          height={480}
        />
      </div>

      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">
          {exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1)} Form Analysis
        </h3>
        <div className="flex items-center gap-4">
          <button
            className={`px-4 py-2 rounded ${isAnalyzing ? 'bg-red-500' : 'bg-primary'} text-white`}
            onClick={() => setIsAnalyzing(!isAnalyzing)}
          >
            {isAnalyzing ? 'Stop Analysis' : 'Start Analysis'}
          </button>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showGuideLines}
              onChange={e => (showGuideLines = e.target.checked)}
              className="form-checkbox"
            />
            Show Guide Lines
          </label>
        </div>
      </div>
    </div>
  );
};

export default WorkoutFormCorrection;

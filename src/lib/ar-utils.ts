import * as poseDetection from '@tensorflow-models/pose-detection';
import { WorkoutType, YogaPose } from '@/config/ar-features';

export interface Point {
  x: number;
  y: number;
  z?: number;
}

export interface Keypoint extends Point {
  score?: number;
  name?: string;
}

export interface PoseAccuracyResult {
  isCorrect: boolean;
  feedback: string[];
}

export interface AngleRange {
  min: number;
  max: number;
}

export interface PoseAngleRequirements {
  [key: string]: AngleRange;
}

export const calculateAngle = (p1: Point, p2: Point, p3: Point): number => {
  const getVector = (a: Point, b: Point) => ({
    x: b.x - a.x,
    y: b.y - a.y,
    z: (b.z || 0) - (a.z || 0),
  });

  const v1 = getVector(p2, p1);
  const v2 = getVector(p2, p3);

  const dotProduct = v1.x * v2.x + v1.y * v2.y + (v1.z || 0) * (v2.z || 0);
  const v1Magnitude = Math.sqrt(v1.x * v1.x + v1.y * v1.y + (v1.z || 0) * (v1.z || 0));
  const v2Magnitude = Math.sqrt(v2.x * v2.x + v2.y * v2.y + (v2.z || 0) * (v2.z || 0));

  const angle = Math.acos(dotProduct / (v1Magnitude * v2Magnitude));
  return (angle * 180) / Math.PI;
};

export const isAngleWithinRange = (angle: number, range: AngleRange): boolean => {
  return angle >= range.min && angle <= range.max;
};

export function getKeypoints(pose: poseDetection.Pose, keypointNames: string[]): Keypoint[] {
  return keypointNames.map(name => {
    const kp = pose.keypoints.find(k => k.name === name);
    return kp ? { x: kp.x, y: kp.y, score: kp.score, name: kp.name } : { x: 0, y: 0 };
  });
}

export const checkPoseAccuracy = (
  pose: poseDetection.Pose,
  type: WorkoutType | YogaPose,
  config: PoseAngleRequirements
): PoseAccuracyResult => {
  const feedback: string[] = [];
  let isCorrect = true;

  Object.entries(config).forEach(([joint, range]) => {
    const points = getKeypoints(pose, [
      `${joint}_start`,
      joint,
      `${joint}_end`,
    ]);
    
    const angle = calculateAngle(points[0], points[1], points[2]);
    const withinRange = isAngleWithinRange(angle, range);

    if (!withinRange) {
      isCorrect = false;
      const adjustment = angle < range.min ? 'increase' : 'decrease';
      feedback.push(`${joint}: Please ${adjustment} angle (current: ${Math.round(angle)}°)`);
    }
  });

  return { isCorrect, feedback };
};

export function drawGuideLines(ctx: CanvasRenderingContext2D, keypoints: Keypoint[]): void {
  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 2;

  keypoints.forEach((keypoint: Keypoint, i: number) => {
    if (i > 0) {
      ctx.beginPath();
      ctx.moveTo(keypoints[i - 1].x, keypoints[i - 1].y);
      ctx.lineTo(keypoint.x, keypoint.y);
      ctx.stroke();
    }
  });
}

export async function setupCamera(videoElement: HTMLVideoElement): Promise<boolean> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false
  });
  videoElement.srcObject = stream;
  
  return new Promise((resolve) => {
    videoElement.onloadedmetadata = () => {
      videoElement.play();
      resolve(true);
    };
  });
} 
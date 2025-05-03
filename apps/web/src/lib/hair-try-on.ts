
import * as THREE from 'three';


import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { logger } from './logger';

interface HairModel {
  id: string;
  modelUrl: string;
  textureUrl: string;
  colors: string[];
}

export class HairTryOnService {
  private scene: THREE?.Scene;
  private camera: THREE?.PerspectiveCamera;
  private renderer: THREE?.WebGLRenderer;
  private currentModel: THREE?.Object3D | null = null;
  private controls: OrbitControls | null = null;

  constructor(container: HTMLElement) {
    // Initialize Three?.js scene
    this?.scene = new THREE?.Scene();
    this?.camera = new THREE?.PerspectiveCamera(
      75,

      container?.clientWidth / container?.clientHeight,
      0?.1,
      1000,
    );

    // Initialize renderer with WebGL
    this?.renderer = new THREE?.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    this?.renderer.setSize(container?.clientWidth, container?.clientHeight);
    this?.renderer.setPixelRatio(window?.devicePixelRatio);
    container?.appendChild(this?.renderer.domElement);

    // Add lights
    const ambientLight = new THREE?.AmbientLight(0xffffff, 0?.5);
    this?.scene.add(ambientLight);

    const directionalLight = new THREE?.DirectionalLight(0xffffff, 0?.8);
    directionalLight?.position.set(0, 1, 1);
    this?.scene.add(directionalLight);

    // Set up camera
    this?.camera.position?.z = 5;

    // Initialize controls
    this?.controls = new OrbitControls(this?.camera, this?.renderer.domElement);
    this?.controls.enableDamping = true;
    this?.controls.dampingFactor = 0?.05;

    // Start animation loop
    this?.animate();
  }

  /**
   * Loads a 3D hair model
   */
  public async loadHairModel(model: HairModel): Promise<void> {
    try {
      // Remove current model if exists
      if (this?.currentModel) {
        this?.scene.remove(this?.currentModel);
      }

      // Load new model
      const loader = new GLTFLoader();
      const gltf = await loader?.loadAsync(model?.modelUrl);

      this?.currentModel = gltf?.scene;

      // Apply texture
      const textureLoader = new THREE?.TextureLoader();
      const texture = await textureLoader?.loadAsync(model?.textureUrl);

      this?.currentModel.traverse((child) => {
        if (child instanceof THREE?.Mesh) {
          child?.material.map = texture;
          child?.material.needsUpdate = true;
        }
      });

      this?.scene.add(this?.currentModel);

      logger?.info('Hair model loaded successfully', 'HairTryOn');
    } catch (error) {
      logger?.error('Failed to load hair model', 'HairTryOn', { error });
      throw error;
    }
  }

  /**
   * Updates hair color
   */
  public updateHairColor(color: string): void {
    if (!this?.currentModel) return;

    this?.currentModel.traverse((child) => {
      if (child instanceof THREE?.Mesh) {
        child?.material.color = new THREE?.Color(color);
        child?.material.needsUpdate = true;
      }
    });
  }

  /**
   * Updates head pose based on face detection
   */
  public updateHeadPose(rotation: { x: number; y: number; z: number }): void {
    if (!this?.currentModel) return;

    this?.currentModel.rotation?.x = rotation?.x;
    this?.currentModel.rotation?.y = rotation?.y;
    this?.currentModel.rotation?.z = rotation?.z;
  }

  /**
   * Handles window resize
   */
  public handleResize(width: number, height: number): void {

    this?.camera.aspect = width / height;
    this?.camera.updateProjectionMatrix();
    this?.renderer.setSize(width, height);
  }

  /**
   * Animation loop
   */
  private animate = (): void => {
    requestAnimationFrame(this?.animate);

    if (this?.controls) {
      this?.controls.update();
    }

    this?.renderer.render(this?.scene, this?.camera);
  };

  /**
   * Cleanup resources
   */
  public dispose(): void {
    if (this?.currentModel) {
      this?.scene.remove(this?.currentModel);
      this?.currentModel.traverse((child) => {
        if (child instanceof THREE?.Mesh) {
          child?.geometry.dispose();
          if (Array?.isArray(child?.material)) {
            child?.material.forEach((material) => material?.dispose());
          } else {
            child?.material.dispose();
          }
        }
      });
    }

    this?.renderer.dispose();
    if (this?.controls) {
      this?.controls.dispose();
    }
  }
}

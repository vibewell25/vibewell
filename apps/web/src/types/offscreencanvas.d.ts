/**

 * Represents a 2D rendering context for OffscreenCanvas

 * Extends the standard CanvasRenderingContext2D with worker-specific features
 */
interface OffscreenCanvasRenderingContext2D extends CanvasRenderingContext2D {
  readonly canvas: OffscreenCanvas;
  

  // Worker-specific commit method
  commit(): void;
/**
 * Represents a WebGL rendering context for OffscreenCanvas
 */
interface OffscreenCanvasWebGLRenderingContext extends WebGLRenderingContext {
  readonly canvas: OffscreenCanvas;
  
  // WebGL specific methods for OffscreenCanvas
  makeXRCompatible(): Promise<void>;
/**
 * Represents a WebGL2 rendering context for OffscreenCanvas
 */
interface OffscreenCanvasWebGL2RenderingContext extends WebGL2RenderingContext {
  readonly canvas: OffscreenCanvas;
  
  // WebGL2 specific methods for OffscreenCanvas
  makeXRCompatible(): Promise<void>;
/**
 * Options for creating a bitmap from the OffscreenCanvas
 */
interface ImageBitmapOptions {
  imageOrientation?: 'none' | 'flipY';
  premultiplyAlpha?: 'none' | 'premultiply' | 'default';
  colorSpaceConversion?: 'none' | 'default';
  resizeWidth?: number;
  resizeHeight?: number;
  resizeQuality?: 'pixelated' | 'low' | 'medium' | 'high';
/**
 * Represents an OffscreenCanvas that can be used in a web worker
 */
interface OffscreenCanvas extends EventTarget {
  width: number;
  height: number;
  
  /**
   * Gets the rendering context for the canvas

   * @param contextId - The type of context to get

   * @param options - Optional context attributes
   */
  getContext(
    contextId: "2d",
    options?: CanvasRenderingContext2DSettings
  ): OffscreenCanvasRenderingContext2D | null;
  getContext(
    contextId: "webgl",
    options?: WebGLContextAttributes
  ): OffscreenCanvasWebGLRenderingContext | null;
  getContext(
    contextId: "webgl2",
    options?: WebGLContextAttributes
  ): OffscreenCanvasWebGL2RenderingContext | null;
  
  /**
   * Converts the canvas contents to a Blob

   * @param options - Optional encoding options
   */
  convertToBlob(options?: {
    type?: string;
    quality?: number;
): Promise<Blob>;

  /**
   * Creates an ImageBitmap from the canvas contents

   * @param options - Optional bitmap creation options
   */
  transferToImageBitmap(options?: ImageBitmapOptions): ImageBitmap;
/**
 * Constructor interface for OffscreenCanvas
 */
declare let OffscreenCanvas: {
  prototype: OffscreenCanvas;
  /**
   * Creates a new OffscreenCanvas

   * @param width - The width of the canvas in pixels

   * @param height - The height of the canvas in pixels
   */
  new(width: number, height: number): OffscreenCanvas;

export interface Tensor {
    shape: number[];
    dtype: DataType;
    size: number;
    strides: number[];
    dataId: {};
    id: number;
    rankType: number;
    dispose(): void;
    data(): Promise<TypedArray>;
export interface LayersModel {
    predict(inputs: Tensor | Tensor[]): Tensor | Tensor[];
    dispose(): void;
    summary(): void;
    layers: Layer[];
export interface Layer {
    name: string;
    trainable: boolean;
    getWeights(): Tensor[];
    apply(inputs: Tensor | Tensor[]): Tensor | Tensor[];
export type DataType = 'float32' | 'int32' | 'bool' | 'complex64' | 'string';
  export type TypedArray = Float32Array | Int32Array | Uint8Array | Uint8ClampedArray;

  export interface ModelPredictConfig {
    batchSize?: number;
    verbose?: boolean;
export interface LoadOptions {
    weightPathPrefix?: string;
    onProgress?: (fraction: number) => void;
export interface ModelArtifacts {
    modelTopology: {};
    weightSpecs: WeightSpec[];
    weightData: ArrayBuffer;
    format?: string;
    generatedBy?: string;
    convertedBy?: string;
export interface WeightSpec {
    name: string;
    shape: number[];
    dtype: DataType;
export interface GraphModel {
    predict(inputs: Tensor | Tensor[]): Tensor | Tensor[];
    execute(inputs: Tensor | Tensor[], outputs?: string[]): Tensor | Tensor[];
    dispose(): void;
export function loadLayersModel(
    pathOrIOHandler: string | ModelArtifacts,
    options?: LoadOptions
  ): Promise<LayersModel>;

  export function loadGraphModel(
    modelUrl: string | ModelArtifacts,
    options?: LoadOptions
  ): Promise<GraphModel>;

  export function tensor(
    values: TypedArray | number[] | number[][],
    shape?: number[],
    dtype?: DataType
  ): Tensor;

  export const browser: {
    fromPixels(
      pixels: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
      numChannels?: number
    ): Tensor;
export function ready(): Promise<void>;
  export function setBackend(backendName: string): void;
  export function getBackend(): string;

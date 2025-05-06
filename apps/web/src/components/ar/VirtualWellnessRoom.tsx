import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { Vector3 } from 'three';

interface RoomProps {
  theme: 'zen' | 'energetic' | 'calming' | 'focus';
  lightingIntensity: number;
  customObjects: Array<{
    id: string;
    type: string;
    position: Vector3;
    rotation: Vector3;
>;
  onCustomize: (updates: any) => void;
const THEME_SETTINGS = {
  zen: {
    ambientLight: '#e8f3ff',
    backgroundColor: '#f5f9ff',
    fogColor: '#ffffff',
energetic: {
    ambientLight: '#fff5e6',
    backgroundColor: '#fff9f0',
    fogColor: '#fff5e6',
calming: {
    ambientLight: '#e6fff5',
    backgroundColor: '#f0fff9',
    fogColor: '#e6fff5',
focus: {
    ambientLight: '#f5e6ff',
    backgroundColor: '#f9f0ff',
    fogColor: '#f5e6ff',
const VirtualWellnessRoom: React.FC<RoomProps> = ({
  theme = 'zen',
  lightingIntensity = 1,
  customObjects = [],
  onCustomize,
) => {
  const [roomState, setRoomState] = useState({
    theme,
    lightingIntensity,
    objects: customObjects,
const handleCustomization = (updates: Partial<typeof roomState>) => {
    setRoomState((prev) => {
      const newState = { ...prev, ...updates };
      onCustomize.(newState);
      return newState;
return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-lg">
      <Canvas camera={{ position: [0, 2, 5], fov: 75 }} shadows gl={{ antialias: true }}>
        <Environment preset="sunset" />
        <ambientLight
          intensity={roomState.lightingIntensity}
          color={THEME_SETTINGS[theme].ambientLight}
        />
        <directionalLight position={[5, 5, 5]} intensity={0.5} castShadow />

        {/* Room Model */}
        <RoomModel theme={theme} />

        {/* Custom Objects */}
        {roomState.objects.map((obj) => (
          <CustomObject key={obj.id} {...obj} />
        ))}

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Customization Controls */}
      <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/90 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <ThemeSelector
            currentTheme={roomState.theme}
            onChange={(newTheme) => handleCustomization({ theme: newTheme })}
          />
          <LightingControls
            intensity={roomState.lightingIntensity}
            onChange={(intensity) => handleCustomization({ lightingIntensity: intensity })}
          />
          <ObjectPlacer
            onAddObject={(object) =>
              handleCustomization({
                objects: [...roomState.objects, object],
)
/>
        </div>
      </div>
    </div>
// Sub-components
const RoomModel: React.FC<{ theme: string }> = ({ theme }) => {
  const { scene } = useGLTF('/models/wellness-room.glb');

  useEffect(() => {
    // Apply theme-specific materials
    scene.traverse((child: any) => {
      if (child.isMesh) {
        // Update materials based on theme
[theme, scene]);

  return <primitive object={scene} />;
const CustomObject: React.FC<any> = ({ type, position, rotation }) => {
  const { scene } = useGLTF(`/models/${type}.glb`);
  return <primitive object={scene} position={position} rotation={rotation} />;
const ThemeSelector: React.FC<{
  currentTheme: string;
  onChange: (theme: 'zen' | 'energetic' | 'calming' | 'focus') => void;
> = ({ currentTheme, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      {Object.keys(THEME_SETTINGS).map((theme) => (
        <button
          key={theme}
          className={`rounded px-3 py-1 ${
            currentTheme === theme ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
`}
          onClick={() => onChange(theme as 'zen' | 'energetic' | 'calming' | 'focus')}
        >
          {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </button>
      ))}
    </div>
const LightingControls: React.FC<{
  intensity: number;
  onChange: (intensity: number) => void;
> = ({ intensity, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm">Lighting</label>
      <input
        type="range"
        min="0"
        max="2"
        step="0.1"
        value={intensity}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-32"
      />
    </div>
const ObjectPlacer: React.FC<{
  onAddObject: (object: any) => void;
> = ({ onAddObject }) => {
  const handleAddObject = (type: string) => {
    onAddObject({
      id: `obj-${Date.now()}`,
      type,
      position: new Vector3(0, 0, 0),
      rotation: new Vector3(0, 0, 0),
return (
    <div className="flex items-center gap-2">
      <button
        className="bg-secondary hover:bg-secondary-dark rounded px-3 py-1 text-white"
        onClick={() => handleAddObject('meditation-cushion')}
      >
        Add Cushion
      </button>
      <button
        className="bg-secondary hover:bg-secondary-dark rounded px-3 py-1 text-white"
        onClick={() => handleAddObject('plant')}
      >
        Add Plant
      </button>
    </div>
export default VirtualWellnessRoom;

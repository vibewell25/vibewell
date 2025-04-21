import React from 'react';
import {
  VirtualWellnessRoom,
  WorkoutFormCorrection,
  MeditationEnvironment,
  YogaPoseEstimation,
} from '@/components/ar';

const ARWellnessPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">AR Wellness Experience</h1>

      {/* Virtual Wellness Room */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Virtual Wellness Room</h2>
        <p className="text-gray-600 mb-6">
          Customize your virtual wellness space with different themes, lighting, and objects.
        </p>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <VirtualWellnessRoom
            theme="zen"
            lightingIntensity={1}
            customObjects={[]}
            onCustomize={updates => console.log('Room customized:', updates)}
          />
        </div>
      </section>

      {/* Workout Form Correction */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Workout Form Analysis</h2>
        <p className="text-gray-600 mb-6">
          Get real-time feedback on your exercise form using AI-powered pose detection.
        </p>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <WorkoutFormCorrection
            exerciseType="squat"
            onFormUpdate={(score, feedback) => {
              console.log('Form score:', score);
              console.log('Feedback:', feedback);
            }}
          />
        </div>
      </section>

      {/* Meditation Environment */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Meditation Space</h2>
        <p className="text-gray-600 mb-6">
          Immerse yourself in a calming environment with customizable soundscapes and visuals.
        </p>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <MeditationEnvironment
            theme="forest"
            soundscape="rain"
            lightingIntensity={1}
            particleEffects={true}
            onStateChange={state => console.log('Meditation state:', state)}
          />
        </div>
      </section>

      {/* Yoga Pose Estimation */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Yoga Pose Guide</h2>
        <p className="text-gray-600 mb-6">
          Perfect your yoga poses with real-time guidance and feedback.
        </p>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <YogaPoseEstimation
            pose="warrior"
            difficulty="beginner"
            showGuideLines={true}
            onPoseUpdate={(score, feedback) => {
              console.log('Pose score:', score);
              console.log('Feedback:', feedback);
            }}
          />
        </div>
      </section>

      {/* Feature Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-3">Virtual Space</h3>
          <p className="text-gray-600">
            Create your perfect wellness environment with customizable themes and objects.
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-3">Form Analysis</h3>
          <p className="text-gray-600">
            Get instant feedback on your workout form using AI technology.
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-3">Meditation</h3>
          <p className="text-gray-600">
            Immerse yourself in calming environments with ambient soundscapes.
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-3">Yoga Guide</h3>
          <p className="text-gray-600">Perfect your yoga practice with real-time pose guidance.</p>
        </div>
      </section>
    </div>
  );
};

export default ARWellnessPage;

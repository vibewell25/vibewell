import {
  VirtualWellnessRoom,
  WorkoutFormCorrection,
  MeditationEnvironment,
  YogaPoseEstimation,
from '@/components/ar';

const ARWellnessPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">AR Wellness Experience</h1>

      {/* Virtual Wellness Room */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-semibold">Virtual Wellness Room</h2>
        <p className="mb-6 text-gray-600">
          Customize your virtual wellness space with different themes, lighting, and objects.
        </p>
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          <VirtualWellnessRoom
            theme="zen"
            lightingIntensity={1}
            customObjects={[]}
            onCustomize={(updates) => console.log('Room customized:', updates)}
          />
        </div>
      </section>

      {/* Workout Form Correction */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-semibold">Workout Form Analysis</h2>
        <p className="mb-6 text-gray-600">
          Get real-time feedback on your exercise form using AI-powered pose detection.
        </p>
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          <WorkoutFormCorrection
            exerciseType="squat"
            onFormUpdate={(score, feedback) => {
              console.log('Form score:', score);
              console.log('Feedback:', feedback);
/>
        </div>
      </section>

      {/* Meditation Environment */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-semibold">Meditation Space</h2>
        <p className="mb-6 text-gray-600">
          Immerse yourself in a calming environment with customizable soundscapes and visuals.
        </p>
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          <MeditationEnvironment
            theme="forest"
            soundscape="rain"
            lightingIntensity={1}
            particleEffects={true}
            onStateChange={(state) => console.log('Meditation state:', state)}
          />
        </div>
      </section>

      {/* Yoga Pose Estimation */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-semibold">Yoga Pose Guide</h2>
        <p className="mb-6 text-gray-600">
          Perfect your yoga poses with real-time guidance and feedback.
        </p>
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          <YogaPoseEstimation
            pose="warrior"
            difficulty="beginner"
            showGuideLines={true}
            onPoseUpdate={(score, feedback) => {
              console.log('Pose score:', score);
              console.log('Feedback:', feedback);
/>
        </div>
      </section>

      {/* Feature Overview */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h3 className="mb-3 text-xl font-semibold">Virtual Space</h3>
          <p className="text-gray-600">
            Create your perfect wellness environment with customizable themes and objects.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h3 className="mb-3 text-xl font-semibold">Form Analysis</h3>
          <p className="text-gray-600">
            Get instant feedback on your workout form using AI technology.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h3 className="mb-3 text-xl font-semibold">Meditation</h3>
          <p className="text-gray-600">
            Immerse yourself in calming environments with ambient soundscapes.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h3 className="mb-3 text-xl font-semibold">Yoga Guide</h3>
          <p className="text-gray-600">Perfect your yoga practice with real-time pose guidance.</p>
        </div>
      </section>
    </div>
export default ARWellnessPage;

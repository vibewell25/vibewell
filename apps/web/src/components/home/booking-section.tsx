import Link from 'next/link';

export default function BookingSection() {
  return (
    <section className="booking-section bg-gray-50 py-16">
      <h2 className="mb-6 text-center text-3xl font-bold">Book Your Appointment</h2>
      <p className="mb-8 text-center text-gray-700">
        Choose from our wide range of services and schedule your session today.
      </p>
      <div className="flex justify-center">
        <Link href="/bookings">
          <button className="bg-primary hover:bg-primary/90 rounded-md px-6 py-3 text-white">
            Start Booking
          </button>
        </Link>
      </div>
    </section>
  );
}

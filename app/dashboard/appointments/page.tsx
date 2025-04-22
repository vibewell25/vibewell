import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import AppointmentCalendar from "@/components/appointments/AppointmentCalendar";
import AppointmentList from "@/components/appointments/AppointmentList";
import NewAppointmentButton from "@/components/appointments/NewAppointmentButton";

export const metadata: Metadata = {
  title: "Appointments | VibeWell",
  description: "Manage your appointments and bookings",
};

export default async function AppointmentsPage() {
  const session = await getServerSession(authOptions);
  
  // Fetch appointments for the current user
  const appointments = await prisma.serviceBooking.findMany({
    where: {
      providerId: session?.user?.id,
    },
    include: {
      user: true,
      service: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
        <NewAppointmentButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow">
          <AppointmentList appointments={appointments} />
        </div>

        {/* Calendar View */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <AppointmentCalendar appointments={appointments} />
        </div>
      </div>
    </div>
  );
} 
export default function AppointmentsPage() {
  // Hardcoded sample appointments for display
  const appointments = [
    {
      id: '1',
      clientName: 'Jane Smith',
      service: 'Haircut & Style',
      date: 'May 10, 2023',
      time: '10:00 AM',
      status: 'confirmed'
    },
    {
      id: '2',
      clientName: 'John Doe',
      service: 'Massage Therapy',
      date: 'May 11, 2023',
      time: '2:30 PM',
      status: 'confirmed'
    },
    {
      id: '3',
      clientName: 'Alice Johnson',
      service: 'Manicure & Pedicure',
      date: 'May 12, 2023',
      time: '1:15 PM',
      status: 'pending'
    },
    {
      id: '4',
      clientName: 'Robert Brown',
      service: 'Facial Treatment',
      date: 'May 15, 2023',
      time: '11:00 AM',
      status: 'cancelled'
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          New Appointment
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.clientName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.service}</td>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.time}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                  <button className="text-red-600 hover:text-red-900">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
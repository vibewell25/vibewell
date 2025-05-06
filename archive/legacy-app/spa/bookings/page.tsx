import LoadingSpinner from '../../../src/components/common/LoadingSpinner';

export default function BookingsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-foreground">My Bookings</h1>
      
      {bookings.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-foreground">{booking.service}</div>
                    <div className="text-sm text-muted-foreground">${booking.price}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    <div>{booking.date}</div>
                    <div>{booking.time}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    {booking.provider}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusStyles(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">
                      Reschedule
                    </button>
                    <span className="mx-2 text-muted-foreground">|</span>
                    <button className="text-destructive hover:text-destructive/80">
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center shadow-sm">
          <p className="mb-4 text-xl text-muted-foreground">You don't have any bookings yet.</p>
          <a href="/spa/services" className="rounded-md bg-primary-600 px-6 py-2 text-white transition-colors hover:bg-primary-700">
            Book a Service
          </a>
        </div>
      )}
    </div>
type Booking = {
  id: number;
  service: string;
  price: number;
  date: string;
  time: string;
  provider: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
function getStatusStyles(status: Booking['status']) {
  switch (status) {
    case 'Confirmed':
      return 'bg-green-100/80 text-green-800';
    case 'Pending':
      return 'bg-yellow-100/80 text-yellow-800';
    case 'Completed':
      return 'bg-blue-100/80 text-blue-800';
    case 'Cancelled':
      return 'bg-red-100/80 text-red-800';
    default:
      return 'bg-muted/50 text-muted-foreground';
// Sample bookings data
const bookings: Booking[] = [
  {
    id: 1,
    service: 'Haircut & Styling',
    price: 45,
    date: 'May 15, 2023',
    time: '10:00 AM',
    provider: 'Sarah Johnson',
    status: 'Confirmed',
{
    id: 2,
    service: 'Manicure & Pedicure',
    price: 55,
    date: 'May 20, 2023',
    time: '2:30 PM',
    provider: 'Jennifer Lee',
    status: 'Pending',
{
    id: 3,
    service: 'Facial Treatment',
    price: 65,
    date: 'April 30, 2023',
    time: '11:00 AM',
    provider: 'Michael Chen',
    status: 'Completed',
{
    id: 4,
    service: 'Massage Therapy',
    price: 80,
    date: 'May 5, 2023',
    time: '4:00 PM',
    provider: 'Robert Wilson',
    status: 'Cancelled',
]; 
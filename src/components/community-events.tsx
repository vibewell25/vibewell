interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string;
  capacity?: number;
  attendees: string[];
  organizer: {
    name: string;
    avatar: string;
  };
  tags: string[];
}

const capacity = event.capacity || 0;
const progress = capacity > 0 ? (event.attendees.length / capacity) * 100 : 0; 
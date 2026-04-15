export const dummyUser = {
  id: 'user123',
  name: 'John Doe',
  email: 'john.doe@email.demo',
  phone: '+1 (555) 201-8844',
};

export const dentistUser = {
  id: 'd1',
  name: 'Dr. Sarah Smith',
  specialty: 'General Dentist',
  email: 'sarah.smith@denticonnect.demo',
  phone: '+1 (415) 555-0142',
  practiceName: 'Mission Bay Dental',
  practiceAddress: '450 Mission St, San Francisco, CA',
};

export const dentists = [
  {
    id: 'd1',
    name: 'Dr. Sarah Smith',
    specialty: 'General Dentist',
    rating: 4.8,
    coordinate: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
    availableSlots: ['09:00', '10:00', '14:00', '15:00'],
    image: 'https://images.unsplash.com/photo-1559839734-2b71f1e3c770?w=400',
  },
  {
    id: 'd2',
    name: 'Dr. James Wilson',
    specialty: 'Orthodontist',
    rating: 4.5,
    coordinate: {
      latitude: 37.78525,
      longitude: -122.4224,
    },
    availableSlots: ['11:00', '13:00', '16:00'],
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
  },
  {
    id: 'd3',
    name: 'Dr. Emily Chen',
    specialty: 'Pediatric Dentist',
    rating: 4.9,
    coordinate: {
      latitude: 37.79125,
      longitude: -122.4424,
    },
    availableSlots: ['08:00', '09:30', '11:30'],
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
  },
  {
    id: 'd4',
    name: 'Dr. Michael Brown',
    specialty: 'Endodontist',
    rating: 4.2,
    coordinate: {
      latitude: 37.78025,
      longitude: -122.4124,
    },
    availableSlots: ['10:00', '11:00', '14:00'],
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400',
  },
  {
    id: 'd5',
    name: 'Dr. Lisa Ray',
    specialty: 'Periodontist',
    rating: 4.7,
    coordinate: {
      latitude: 37.79525,
      longitude: -122.4524,
    },
    availableSlots: ['09:00', '15:00', '16:00'],
    image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400',
  },
];

export const mockAppointments = [
  {
    id: 'a1',
    dentistId: 'd1',
    patientName: 'John Doe',
    patientId: 'user123',
    date: '2026-04-10',
    time: '09:00',
    status: 'Confirmed',
    treatmentType: 'Routine cleaning & exam',
    room: 'Chair 2',
    notes: 'Requested fluoride varnish.',
  },
  {
    id: 'a2',
    dentistId: 'd1',
    patientName: 'Jane Smith',
    patientId: 'p2',
    date: '2026-04-12',
    time: '14:00',
    status: 'Pending',
    treatmentType: 'Filling follow-up',
    room: 'Chair 1',
    notes: 'Review sensitivity on lower left.',
  },
  {
    id: 'a3',
    dentistId: 'd2',
    patientName: 'Alice Johnson',
    patientId: 'p3',
    date: '2026-04-15',
    time: '11:00',
    status: 'Confirmed',
    treatmentType: 'Braces adjustment',
    room: 'Ortho 1',
    notes: '',
  },
  {
    id: 'a4',
    dentistId: 'd1',
    patientName: 'John Doe',
    patientId: 'user123',
    date: '2026-03-02',
    time: '10:30',
    status: 'Confirmed',
    treatmentType: 'Periodic exam',
    room: 'Chair 2',
    notes: 'No issues noted.',
  },
  {
    id: 'a5',
    dentistId: 'd1',
    patientName: 'John Doe',
    patientId: 'user123',
    date: '2026-04-11',
    time: '11:00',
    status: 'Confirmed',
    treatmentType: 'Follow-up consultation',
    room: 'Chair 1',
    notes: '',
  },
];

export const mockPatients = [
  {
    id: 'user123',
    name: 'John Doe',
    phone: '+1 (555) 201-8844',
    email: 'john.doe@email.demo',
    lastVisit: '2026-04-10',
    dentistId: 'd1',
  },
  {
    id: 'p2',
    name: 'Jane Smith',
    phone: '+1 (555) 302-1190',
    email: 'jane.smith@email.demo',
    lastVisit: '2026-04-12',
    dentistId: 'd1',
  },
  {
    id: 'p4',
    name: 'Robert Lee',
    phone: '+1 (555) 441-0098',
    email: 'robert.lee@email.demo',
    lastVisit: '2026-03-18',
    dentistId: 'd1',
  },
  {
    id: 'p5',
    name: 'Maria Garcia',
    phone: '+1 (555) 778-2201',
    email: 'maria.g@email.demo',
    lastVisit: '2026-02-05',
    dentistId: 'd1',
  },
];

export const blockedDates = {
  '2026-04-20': { blocked: true },
  '2026-04-25': { blocked: true },
};

import {Booking} from '@/types';

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    user_id: 'u1',
    service_id: '3',
    date: '2026-02-20',
    time_slot: '10:00',
    status: 'confirmed',
    notes: 'Sensitive skin, please use gentle products.',
  },
  {
    id: 'b2',
    user_id: 'u1',
    service_id: '5',
    date: '2026-02-15',
    time_slot: '14:00',
    status: 'confirmed',
  },
  {
    id: 'b3',
    user_id: 'u1',
    service_id: '7',
    date: '2026-02-10',
    time_slot: '11:30',
    status: 'cancelled',
  },
];

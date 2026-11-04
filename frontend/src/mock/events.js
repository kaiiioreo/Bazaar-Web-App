export const events = [
  {
    event_id: 1,
    name: 'Saturday Community Bazaar',
    date: '2026-11-14',
    location: 'Central Plaza',
    total_slots: 20,
    status: 'upcoming',
    registration_open: true,
    preregistered: [
      { vendor_id: 1, business_name: "Aling Nena's Fresh Produce", registered_at: '2026-11-01' },
      { vendor_id: 2, business_name: 'Handwoven Treasures by Lita', registered_at: '2026-11-02' },
      { vendor_id: 4, business_name: 'Kape Kuya Coffee Cart', registered_at: '2026-11-03' },
    ],
  },
  {
    event_id: 2,
    name: 'Holiday Market',
    date: '2026-12-05',
    location: 'Town Gymnasium',
    total_slots: 2, // deliberately small so the "over capacity" warning shows
    status: 'upcoming',
    registration_open: false,
    preregistered: [
      { vendor_id: 1, business_name: "Aling Nena's Fresh Produce", registered_at: '2026-11-04' },
      { vendor_id: 2, business_name: 'Handwoven Treasures by Lita', registered_at: '2026-11-04' },
      { vendor_id: 4, business_name: 'Kape Kuya Coffee Cart', registered_at: '2026-11-04' },
    ],
  },
  {
    event_id: 3,
    name: 'Harvest Festival Bazaar',
    date: '2026-10-17',
    location: 'Community Hall',
    total_slots: 15,
    status: 'completed',
    registration_open: false,
    preregistered: [
      { vendor_id: 1, business_name: "Aling Nena's Fresh Produce", registered_at: '2026-10-05' },
    ],
  },
  {
    event_id: 4,
    name: 'Rainy Day Night Market',
    date: '2026-09-26',
    location: 'Central Plaza',
    total_slots: 12,
    status: 'cancelled',
    registration_open: false,
    preregistered: [],
  },
]
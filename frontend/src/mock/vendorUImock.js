// Fake data for the vendor pages, shaped like the SDD data dictionary (section 4.2.1).
// Replace with Axios calls in src/api/ in Phase 2.

export const vendorProfile = {
  vendor_id: 1,
  business_name: 'Crafted Goods PH',
  description: 'Handmade bags and home goods from Cebu.',
  profile_image: '', // image URL; empty shows the business initial
  contact_info: 'hello@craftedgoods.ph',
  contact_phone: '0917 123 4567', // not in the SDD yet: add to VendorProfile
}

export const vendorProducts = [
  { product_id: 1, vendor_id: 1, name: 'Woven bag', description: 'Handwoven abaca bag.', price: 450, category: 'Accessories', stock_status: 'in_stock', image: '' },
  { product_id: 2, vendor_id: 1, name: 'Ceramic mug', description: 'Hand-thrown stoneware mug.', price: 180, category: 'Home', stock_status: 'low_stock', image: '' },
  { product_id: 3, vendor_id: 1, name: 'Tote bag', description: 'Canvas tote, hand-printed.', price: 320, category: 'Accessories', stock_status: 'out_of_stock', image: '' },
  { product_id: 4, vendor_id: 1, name: 'Scented candle', description: 'Soy wax, small batch.', price: 150, category: 'Home', stock_status: 'in_stock', image: '' },
]

export const bazaarEvents = [
  { event_id: 1, name: 'Ayala Terraces Bazaar', date: '2026-11-07', location: 'Ayala Terraces', total_slots: 40, status: 'upcoming' },
  { event_id: 2, name: 'IT Park Night Market', date: '2026-11-14', location: 'IT Park Grounds', total_slots: 30, status: 'upcoming' },
  { event_id: 3, name: 'Mandaue Weekend Bazaar', date: '2026-11-28', location: 'Mandaue City Hall', total_slots: 25, status: 'upcoming' },
]

// Events this vendor already pre-registered for (VendorSchedule).
export const vendorSchedule = [{ schedule_id: 1, vendor_id: 1, event_id: 1, status: 'PreRegistered' }]

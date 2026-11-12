// Mock data for the customer UI.
// Keep field names aligned with the SDD data dictionary; adjust here if they differ.
// Later, replace these exports with real API calls (e.g. fetch('/api/vendors')).

export const vendors = [
  { id: 'v1', name: "Nena's Rosquillos", category: 'Snacks', accent: '#b45309', rating: 4.8, reviewCount: 42,
    description: 'Hand-rolled sweet rosquillos baked fresh every morning, a Liloan family recipe.',
    aiSummary: 'Reviewers praise the crisp texture and fair prices. A few mention that stock runs out before noon.' },
  { id: 'v2', name: 'Carcar Crunch', category: 'Snacks', accent: '#be123c', rating: 4.6, reviewCount: 31,
    description: 'Crispy chicharon in plain, spicy, and vinegar-dip packs.',
    aiSummary: 'Customers love the spicy pack and the generous portions. Some find the plain pack too salty.' },
  { id: 'v3', name: 'Sugbo Dried Mango', category: 'Fruits', accent: '#d97706', rating: 4.9, reviewCount: 58,
    description: 'Sweet dried Cebu mangoes, sold by the pack or as gift boxes.',
    aiSummary: 'Consistently described as sweet, chewy, and good value. Gift boxes are a repeat favorite.' },
  { id: 'v4', name: 'Habal Handmade', category: 'Crafts', accent: '#0f766e', rating: 4.5, reviewCount: 19,
    description: 'Woven bags, coasters, and keychains made by local weavers.',
    aiSummary: 'Buyers like the sturdy weaving and bright colors. Custom orders take longer than expected.' },
  { id: 'v5', name: 'Kape Sugbo', category: 'Drinks', accent: '#44403c', rating: 4.7, reviewCount: 36,
    description: 'Locally roasted barako coffee beans and cold brew bottles.',
    aiSummary: 'Strong, smooth flavor is the most common compliment. Cold brew sells out quickly.' },
  { id: 'v6', name: 'Tabo Plants', category: 'Plants', accent: '#15803d', rating: 4.4, reviewCount: 12,
    description: 'Small succulents, herbs, and starter pots for apartments.',
    aiSummary: 'Healthy plants and helpful care tips from the seller. Limited variety on busy days.' },
];

export const products = [
  { id: 'p1', vendorId: 'v1', name: 'Rosquillos (12 pcs)', price: 90, category: 'Snacks', stock: 'in_stock', description: 'Sweet, crisp rosquillos in a paper bag.' },
  { id: 'p2', vendorId: 'v1', name: 'Rosquillos gift tin', price: 220, category: 'Snacks', stock: 'low_stock', description: 'A sweet gift tin of 30 rosquillos.' },
  { id: 'p3', vendorId: 'v2', name: 'Spicy chicharon', price: 75, category: 'Snacks', stock: 'in_stock', description: 'Crunchy pork chicharon with chili.' },
  { id: 'p4', vendorId: 'v2', name: 'Plain chicharon', price: 70, category: 'Snacks', stock: 'out_of_stock', description: 'Classic salted chicharon.' },
  { id: 'p5', vendorId: 'v3', name: 'Dried mango (100g)', price: 85, category: 'Fruits', stock: 'in_stock', description: 'Sweet and chewy dried mango slices.' },
  { id: 'p6', vendorId: 'v3', name: 'Mango gift box', price: 260, category: 'Fruits', stock: 'low_stock', description: 'Three packs of dried mango in a gift box.' },
  { id: 'p7', vendorId: 'v4', name: 'Woven tote bag', price: 350, category: 'Crafts', stock: 'in_stock', description: 'Handwoven tote in assorted colors.' },
  { id: 'p8', vendorId: 'v4', name: 'Coaster set (4)', price: 120, category: 'Crafts', stock: 'in_stock', description: 'Woven coasters, set of four.' },
  { id: 'p9', vendorId: 'v5', name: 'Barako beans (250g)', price: 180, category: 'Drinks', stock: 'in_stock', description: 'Medium roast barako coffee beans.' },
  { id: 'p10', vendorId: 'v5', name: 'Cold brew bottle', price: 110, category: 'Drinks', stock: 'low_stock', description: 'Ready-to-drink cold brew, 250ml.' },
  { id: 'p11', vendorId: 'v6', name: 'Succulent in clay pot', price: 95, category: 'Plants', stock: 'in_stock', description: 'Small succulent in a hand-painted pot.' },
  { id: 'p12', vendorId: 'v6', name: 'Basil starter pot', price: 60, category: 'Plants', stock: 'out_of_stock', description: 'Herb starter pot for the kitchen window.' },
];

export const events = [
  { id: 'e1', name: 'Plaza Independencia Bazaar', date: '2026-11-14', location: 'Plaza Independencia, Cebu City', totalStalls: 20, vendorIds: ['v1', 'v3', 'v5', 'v6'] },
  { id: 'e2', name: 'Fuente Weekend Market', date: '2026-11-28', location: 'Fuente Osmeña Circle, Cebu City', totalStalls: 16, vendorIds: ['v1', 'v2', 'v4'] },
  { id: 'e3', name: 'Christmas Bazaar', date: '2026-12-12', location: 'Plaza Independencia, Cebu City', totalStalls: 24, vendorIds: ['v2', 'v3', 'v4', 'v5'] },
];

export const reviews = [
  { id: 'r1', vendorId: 'v1', author: 'Ana R.', rating: 5, comment: 'Still warm when I bought it. Worth the early trip.', date: '2026-10-18' },
  { id: 'r2', vendorId: 'v1', author: 'Miguel T.', rating: 4, comment: 'Great taste, but the gift tin was sold out by 11am.', date: '2026-10-11' },
  { id: 'r3', vendorId: 'v3', author: 'Jo L.', rating: 5, comment: 'Best dried mango I have had. Bought three boxes.', date: '2026-10-15' },
  { id: 'r4', vendorId: 'v5', author: 'Paolo D.', rating: 5, comment: 'Smooth and strong. The cold brew is a must.', date: '2026-10-09' },
  { id: 'r5', vendorId: 'v2', author: 'Grace M.', rating: 4, comment: 'Spicy pack is addictive. Plain was a bit salty.', date: '2026-10-05' },
  { id: 'r6', vendorId: 'v4', author: 'Ken S.', rating: 4, comment: 'Sturdy tote. Custom color took two weeks.', date: '2026-09-29' },
];

// ---- Lookup helpers (swap for API calls later) ----
export const getVendor = (id) => vendors.find((v) => v.id === id);
export const getVendorProducts = (id) => products.filter((p) => p.vendorId === id);
export const getVendorReviews = (id) => reviews.filter((r) => r.vendorId === id);
export const getVendorEvents = (id) => events.filter((e) => e.vendorIds.includes(id));

// ---- Mock of the AI natural-language search ----
// Real version: POST the query to the AI Integration module and return its results.
const STOP = new Set(['a', 'an', 'the', 'for', 'of', 'to', 'and', 'or', 'with', 'under', 'below', 'something',
  'some', 'any', 'me', 'i', 'want', 'looking', 'find', 'sell', 'selling', 'that', 'is', 'are', 'in', 'on',
  'at', 'my', 'show', 'best', 'good', 'who']);

export function searchCatalog(query) {
  const tokens = query.toLowerCase().split(/\W+/).filter((t) => t && !STOP.has(t) && !/^\d+$/.test(t));
  if (!tokens.length) return { vendors: [], products: [] };
  const hit = (text) => tokens.some((t) => text.toLowerCase().includes(t));
  const matchedProducts = products.filter((p) => hit(`${p.name} ${p.description} ${p.category}`));
  const matchedVendors = vendors.filter(
    (v) => hit(`${v.name} ${v.description} ${v.category}`) || matchedProducts.some((p) => p.vendorId === v.id)
  );
  return { vendors: matchedVendors, products: matchedProducts };
}

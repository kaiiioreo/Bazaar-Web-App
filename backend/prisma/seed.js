// Fills the database with demo data built from the frontend mocks.
// Run with: npm run db:seed   (WARNING: this deletes all existing data first)
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma.js'

const PASSWORD = 'Password123'
const daysFromToday = (n) => {
  const d = new Date()
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate() + n))
}
const daysAgo = (n) => new Date(Date.now() - n * 86400000)
const label = (i) => `${String.fromCharCode(65 + Math.floor(i / 5))}-${String((i % 5) + 1).padStart(2, '0')}`

async function main() {
  console.log('Clearing old data...')
  await prisma.$executeRawUnsafe(
    'TRUNCATE notifications, reviews, favorites, vendor_schedules, bazaar_slots, bazaar_events, products, vendor_profiles, vendor_applications, users RESTART IDENTITY CASCADE',
  )

  const password_hash = await bcrypt.hash(PASSWORD, 10)
  const makeUser = (name, email, role, status = 'active', created = 60) =>
    prisma.user.create({ data: { name, email, role, status, password_hash, created_at: daysAgo(created) } })

  /* ---------- Users ---------- */
  const admin = await makeUser('Bazaar Admin', 'admin@bazaar.ph', 'admin', 'active', 90)

  const vendorSeed = [
    {
      email: 'vendor@bazaar.ph',
      owner: 'Nena Santos',
      business_name: "Nena's Rosquillos",
      category: 'Snacks',
      description: 'Hand-rolled sweet rosquillos baked fresh every morning, a Liloan family recipe.',
      ai_summary: 'Reviewers praise the crisp texture and fair prices. A few mention that stock runs out before noon.',
      contact_phone: '0917 123 4567',
      products: [
        ['Rosquillos (12 pcs)', 90, 'Snacks', 'in_stock', 'Sweet, crisp rosquillos in a paper bag.'],
        ['Rosquillos gift tin', 220, 'Snacks', 'low_stock', 'A sweet gift tin of 30 rosquillos.'],
      ],
    },
    {
      email: 'carcarcrunch@bazaar.ph',
      owner: 'Ramil Ybañez',
      business_name: 'Carcar Crunch',
      category: 'Snacks',
      description: 'Crispy chicharon in plain, spicy, and vinegar-dip packs.',
      ai_summary: 'Customers love the spicy pack and the generous portions. Some find the plain pack too salty.',
      products: [
        ['Spicy chicharon', 75, 'Snacks', 'in_stock', 'Crunchy chicharon with chili flakes.'],
        ['Plain chicharon', 70, 'Snacks', 'out_of_stock', 'Classic salted chicharon.'],
      ],
    },
    {
      email: 'sugbomango@bazaar.ph',
      owner: 'Lita Gomez',
      business_name: 'Sugbo Dried Mango',
      category: 'Food',
      description: 'Sweet dried Cebu mangoes, sold by the pack or as gift boxes.',
      ai_summary: 'Consistently described as sweet, chewy, and good value. Gift boxes are a repeat favorite.',
      products: [
        ['Dried mango (100g)', 85, 'Food', 'in_stock', 'Sweet and chewy dried mango slices.'],
        ['Mango gift box', 260, 'Food', 'low_stock', 'Three packs of dried mango in a gift box.'],
      ],
    },
    {
      email: 'habal@bazaar.ph',
      owner: 'Grace Mendoza',
      business_name: 'Habal Handmade',
      category: 'Crafts',
      description: 'Woven bags, coasters, and keychains made by local weavers.',
      ai_summary: 'Buyers like the sturdy weaving and bright colors. Custom orders take longer than expected.',
      products: [
        ['Woven tote bag', 350, 'Crafts', 'in_stock', 'Handwoven tote in assorted colors.'],
        ['Coaster set (4)', 120, 'Crafts', 'in_stock', 'Woven coasters, set of four.'],
      ],
    },
    {
      email: 'kapesugbo@bazaar.ph',
      owner: 'Paolo Dizon',
      business_name: 'Kape Sugbo',
      category: 'Drinks',
      description: 'Locally roasted barako coffee beans and cold brew bottles.',
      ai_summary: 'Strong, smooth flavor is the most common compliment. Cold brew sells out quickly.',
      products: [
        ['Barako beans (250g)', 180, 'Drinks', 'in_stock', 'Medium roast barako coffee beans.'],
        ['Cold brew bottle', 110, 'Drinks', 'low_stock', 'Ready-to-drink cold brew, 250ml.'],
      ],
    },
    {
      email: 'tabo@bazaar.ph',
      owner: 'Ken Sarmiento',
      business_name: 'Tabo Plants',
      category: 'Plants',
      description: 'Small succulents, herbs, and starter pots for apartments.',
      ai_summary: 'Healthy plants and helpful care tips from the seller. Limited variety on busy days.',
      products: [
        ['Succulent in clay pot', 95, 'Plants', 'in_stock', 'Small succulent in a hand-painted pot.'],
        ['Basil starter pot', 60, 'Plants', 'out_of_stock', 'Herb starter pot for the kitchen window.'],
      ],
    },
    {
      email: 'chocobod@bazaar.ph',
      owner: 'Ramon Dela Cruz',
      business_name: 'Choco Bod Sweets',
      category: 'Baked Goods',
      description: 'Chocolate treats and pastries.',
      status: 'suspended',
      ai_summary: '',
      products: [['Chocobod cake', 280, 'Baked Goods', 'out_of_stock', 'Rich chocolate cake, whole.']],
    },
  ]

  const vendors = []
  for (const [i, v] of vendorSeed.entries()) {
    const user = await makeUser(v.owner, v.email, 'vendor', v.status ?? 'active', 70 - i)
    await prisma.vendorApplication.create({
      data: {
        user_id: user.user_id,
        business_name: v.business_name,
        product_category: v.category,
        business_details: v.description,
        status: 'approved',
        submitted_at: daysAgo(65 - i),
        reviewed_at: daysAgo(63 - i),
      },
    })
    const profile = await prisma.vendorProfile.create({
      data: {
        vendor_id: user.user_id,
        business_name: v.business_name,
        category: v.category,
        description: v.description,
        contact_info: v.email,
        contact_phone: v.contact_phone ?? null,
        ai_summary: v.ai_summary || null,
        products: {
          create: v.products.map(([name, price, category, stock_status, description]) => ({
            name,
            price,
            category,
            stock_status,
            description,
          })),
        },
      },
    })
    vendors.push(profile)
  }
  const [rosquillos, carcar, mango, habal, kape, tabo, chocobod] = vendors

  // Applicants still waiting for review (vendor accounts without a profile yet).
  const applicants = [
    [
      "Aling Nena's Fresh Produce",
      'Nena Villanueva',
      'freshproduce@bazaar.ph',
      'Produce',
      'Vegetables and fruits harvested daily from our family farm in Dalaguete.',
      'pending',
      false,
      null,
      6,
    ],
    [
      'Sweet Tooth Bakes',
      'Marco Reyes',
      'sweettooth@bazaar.ph',
      'Baked Goods',
      'Homemade pastries.',
      'pending',
      true,
      'Business details are very short or incomplete.',
      4,
    ],
    [
      'Quick Cheap Stuff',
      'Ben Cruz',
      'quickcheap@bazaar.ph',
      'Other',
      'Various items.',
      'rejected',
      true,
      'Business details are very short or incomplete.',
      20,
    ],
  ]
  for (const [
    business_name,
    name,
    email,
    product_category,
    business_details,
    status,
    ai_flag,
    ai_flag_reason,
    ago,
  ] of applicants) {
    const user = await makeUser(name, email, 'vendor', 'active', ago + 1)
    await prisma.vendorApplication.create({
      data: {
        user_id: user.user_id,
        business_name,
        product_category,
        business_details,
        status,
        ai_flag,
        ai_flag_reason,
        submitted_at: daysAgo(ago),
        reviewed_at: status === 'pending' ? null : daysAgo(ago - 2),
        rejection_reason: status === 'rejected' ? 'Please describe the products you plan to sell.' : null,
      },
    })
  }

  const customerSeed = [
    ['Joshua Bautista', 'customer@bazaar.ph'],
    ['Ana Reyes', 'ana@example.com'],
    ['Miguel Torres', 'miguel@example.com'],
    ['Jo Lim', 'jo@example.com'],
    ['Grace Manalo', 'grace@example.com'],
    ['Angela Torres', 'angela@example.com'],
    ['user88213', 'user88213@example.com'],
    ['promo_deals_ph', 'promo@example.com'],
    ['Maria Lopez', 'maria@example.com', 'suspended'],
  ]
  const customers = {}
  for (const [i, [name, email, status]] of customerSeed.entries()) {
    customers[email] = await makeUser(name, email, 'customer', status ?? 'active', 50 - i)
  }
  const c = (email) => customers[email].user_id

  /* ---------- Reviews ---------- */
  const reviewSeed = [
    [c('ana@example.com'), rosquillos, 5, 'Still warm when I bought it. Worth the early trip.', 27],
    [c('miguel@example.com'), rosquillos, 4, 'Great taste, but the gift tin was sold out by 11am.', 34],
    [c('jo@example.com'), mango, 5, 'Best dried mango I have had. Bought three boxes.', 30],
    [c('customer@bazaar.ph'), kape, 5, 'Smooth and strong. The cold brew is a must.', 36],
    [c('grace@example.com'), carcar, 4, 'Spicy pack is addictive. Plain was a bit salty.', 40],
    [c('miguel@example.com'), habal, 4, 'Sturdy tote. Custom color took two weeks.', 46],
    [
      c('customer@bazaar.ph'),
      rosquillos,
      3,
      'Good rosquillos but the line was very long and I waited almost 30 minutes.',
      12,
    ],
    [
      c('user88213@example.com'),
      carcar,
      5,
      'BEST CHICHARON EVER!!! Amazing amazing amazing, 10/10, everyone must buy here!!!',
      16,
      true,
      'Possible fake review: generic praise, repeated phrasing, and excessive punctuation.',
    ],
    [
      c('angela@example.com'),
      chocobod,
      1,
      'Terrible. The owner was rude to me and called me names. Absolute garbage seller, avoid this useless person.',
      13,
      true,
      'Possible abusive language and a personal attack on the vendor.',
    ],
    [
      c('promo@example.com'),
      kape,
      5,
      'Great coffee! Also check out my shop for cheap deals, visit www.example.com now!!!',
      11,
      true,
      'Possible spam: contains a promotional link unrelated to the vendor.',
    ],
    [c('grace@example.com'), tabo, 1, 'Worst place ever, do not go.', 20, false, null, 'removed'],
  ]
  for (const [
    customer_id,
    vendor,
    rating,
    comment,
    ago,
    ai_flag = false,
    ai_flag_reason = null,
    status = 'visible',
  ] of reviewSeed) {
    await prisma.review.create({
      data: {
        customer_id,
        vendor_id: vendor.vendor_id,
        rating,
        comment,
        ai_flag,
        ai_flag_reason,
        status,
        created_at: daysAgo(ago),
      },
    })
  }

  /* ---------- Events, stalls, and vendor schedules ---------- */
  async function makeEvent({
    name,
    offset,
    location,
    total_slots,
    status = 'upcoming',
    registration_open = true,
    assigned = [],
    waiting = [],
  }) {
    const ev = await prisma.bazaarEvent.create({
      data: {
        name,
        date: daysFromToday(offset),
        location,
        total_slots,
        status,
        registration_open,
        created_by: admin.user_id,
        slots: { create: Array.from({ length: total_slots }, (_, i) => ({ label: label(i) })) },
      },
      include: { slots: true },
    })
    const slots = ev.slots.sort((a, b) => a.slot_id - b.slot_id)
    for (const [i, vendor] of assigned.entries()) {
      const slot = slots[i]
      await prisma.bazaarSlot.update({
        where: { slot_id: slot.slot_id },
        data: { vendor_id: vendor.vendor_id, status: 'assigned' },
      })
      await prisma.vendorSchedule.create({
        data: {
          vendor_id: vendor.vendor_id,
          event_id: ev.event_id,
          slot_id: slot.slot_id,
          status: 'assigned',
          registered_at: daysAgo(10 + i),
        },
      })
    }
    for (const [i, vendor] of waiting.entries()) {
      await prisma.vendorSchedule.create({
        data: { vendor_id: vendor.vendor_id, event_id: ev.event_id, registered_at: daysAgo(3 + i) },
      })
    }
    return ev
  }

  await makeEvent({
    name: 'Plaza Independencia Bazaar',
    offset: 7,
    location: 'Plaza Independencia, Cebu City',
    total_slots: 20,
    assigned: [rosquillos, mango, kape, tabo],
    waiting: [carcar],
  })
  await makeEvent({
    name: 'Fuente Weekend Market',
    offset: 14,
    location: 'Fuente Osmeña Circle, Cebu City',
    total_slots: 16,
    assigned: [rosquillos, carcar],
    waiting: [habal],
  })
  await makeEvent({
    name: 'Christmas Bazaar',
    offset: 28,
    location: 'IT Park Grounds, Cebu City',
    total_slots: 24,
    registration_open: true,
  })
  await makeEvent({
    name: 'Harvest Festival Bazaar',
    offset: -28,
    location: 'Mandaue City Hall Grounds',
    total_slots: 15,
    status: 'completed',
    registration_open: false,
    assigned: [rosquillos, habal],
  })
  await makeEvent({
    name: 'Rainy Day Night Market',
    offset: -49,
    location: 'Ayala Terraces, Cebu City',
    total_slots: 12,
    status: 'cancelled',
    registration_open: false,
  })

  /* ---------- Favorites and notifications ---------- */
  for (const v of [rosquillos, mango, kape]) {
    await prisma.favorite.create({
      data: { customer_id: c('customer@bazaar.ph'), target_type: 'vendor', vendor_id: v.vendor_id },
    })
  }
  await prisma.notification.createMany({
    data: [
      {
        user_id: c('customer@bazaar.ph'),
        type: 'schedule_update',
        message: "Nena's Rosquillos will be at Plaza Independencia Bazaar (Stall A-01).",
        link: `/customer/vendors/${rosquillos.vendor_id}`,
        created_at: daysAgo(2),
      },
      {
        user_id: c('customer@bazaar.ph'),
        type: 'restock',
        message: 'Mango gift box from Sugbo Dried Mango is back in stock.',
        link: `/customer/vendors/${mango.vendor_id}`,
        created_at: daysAgo(1),
      },
      {
        user_id: rosquillos.vendor_id,
        type: 'stall_assigned',
        message: 'You were assigned Stall A-01 for Plaza Independencia Bazaar.',
        link: '/vendor',
        created_at: daysAgo(2),
      },
    ],
  })

  console.log(`\nDone. Demo accounts (password for all: ${PASSWORD})`)
  console.log('  Admin:    admin@bazaar.ph')
  console.log("  Vendor:   vendor@bazaar.ph   (Nena's Rosquillos, approved)")
  console.log('  Pending:  sweettooth@bazaar.ph (vendor waiting for approval)')
  console.log('  Customer: customer@bazaar.ph')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

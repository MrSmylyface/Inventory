require('../src/config/env')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../src/models/User')
const Category = require('../src/models/Category')
const Item = require('../src/models/Item')

const seedUser = {
  username: 'admin',
  email: 'admin@inventory.local',
  password: 'admin123',
  role: 'admin',
}

const categories = [
  { name: 'Fasteners',   description: 'Bolts, screws, anchors and fixings' },
  { name: 'Power Tools', description: 'Corded and cordless tools' },
  { name: 'Electrical',  description: 'Cable, conduit and terminations' },
  { name: 'Safety',      description: 'PPE and site safety equipment' },
  { name: 'Packaging',   description: 'Cartons, strapping and wrap' },
  { name: 'Adhesives',   description: 'Sealants, tapes and compounds' },
]

// Quantities are deliberately spread across in-stock / low / out-of-stock so the
// reorder dashboard has something real to show on a fresh install.
const itemsData = [
  { sku: 'FST-1042', name: 'M10 Hex Bolt, Zinc — 60mm (Box of 100)',   quantity: 480, reorderPoint: 150, price: 18.40,  supplier: 'Halloran Fixings',    bin: 'A-01-3', categoryName: 'Fasteners' },
  { sku: 'FST-1044', name: 'M10 Hex Nut, Zinc (Box of 200)',           quantity: 96,  reorderPoint: 120, price: 11.25,  supplier: 'Halloran Fixings',    bin: 'A-01-4', categoryName: 'Fasteners' },
  { sku: 'FST-2210', name: 'Wedge Anchor 12 x 100mm (Box of 50)',      quantity: 0,   reorderPoint: 40,  price: 42.00,  supplier: 'Halloran Fixings',    bin: 'A-02-1', categoryName: 'Fasteners' },
  { sku: 'FST-2317', name: 'Self-Drilling Screw 5.5 x 32mm (Box 500)', quantity: 215, reorderPoint: 80,  price: 24.90,  supplier: 'Northgate Supply Co', bin: 'A-02-6', categoryName: 'Fasteners' },

  { sku: 'PWR-3301', name: '18V Brushless Impact Driver, Bare Unit',   quantity: 12,  reorderPoint: 6,   price: 189.00, supplier: 'Redlands Tool Group', bin: 'C-04-1', categoryName: 'Power Tools' },
  { sku: 'PWR-3308', name: '18V 5.0Ah Battery Pack',                   quantity: 4,   reorderPoint: 10,  price: 94.50,  supplier: 'Redlands Tool Group', bin: 'C-04-2', categoryName: 'Power Tools' },
  { sku: 'PWR-3402', name: '230V Angle Grinder 125mm',                 quantity: 9,   reorderPoint: 4,   price: 132.00, supplier: 'Redlands Tool Group', bin: 'C-05-1', categoryName: 'Power Tools' },
  { sku: 'PWR-3455', name: 'Diamond Cutting Disc 125mm (Pack of 10)',  quantity: 31,  reorderPoint: 25,  price: 58.00,  supplier: 'Redlands Tool Group', bin: 'C-05-4', categoryName: 'Power Tools' },

  { sku: 'ELC-5120', name: 'Twin & Earth Cable 2.5mm² — 100m Drum',    quantity: 22,  reorderPoint: 8,   price: 148.00, supplier: 'Vantage Electrical',  bin: 'D-01-1', categoryName: 'Electrical' },
  { sku: 'ELC-5135', name: 'SWA Cable 4mm² 3-Core — 50m Drum',         quantity: 3,   reorderPoint: 6,   price: 312.00, supplier: 'Vantage Electrical',  bin: 'D-01-2', categoryName: 'Electrical' },
  { sku: 'ELC-5240', name: 'PVC Conduit 20mm — 3m Length',             quantity: 140, reorderPoint: 60,  price: 4.15,   supplier: 'Vantage Electrical',  bin: 'D-02-5', categoryName: 'Electrical' },
  { sku: 'ELC-5418', name: 'Junction Box IP66, 4-Way',                 quantity: 0,   reorderPoint: 30,  price: 9.80,   supplier: 'Northgate Supply Co', bin: 'D-03-2', categoryName: 'Electrical' },

  { sku: 'SAF-7002', name: 'Safety Helmet, Vented — White',            quantity: 64,  reorderPoint: 30,  price: 14.60,  supplier: 'Corven Safety',       bin: 'B-06-1', categoryName: 'Safety' },
  { sku: 'SAF-7015', name: 'Cut-Resistant Glove, Level D — Pair (L)',  quantity: 18,  reorderPoint: 40,  price: 7.95,   supplier: 'Corven Safety',       bin: 'B-06-3', categoryName: 'Safety' },
  { sku: 'SAF-7099', name: 'Hi-Vis Vest, Class 2 — XL',                quantity: 112, reorderPoint: 50,  price: 6.20,   supplier: 'Corven Safety',       bin: 'B-06-5', categoryName: 'Safety' },

  { sku: 'PKG-9010', name: 'Double-Wall Carton 450 x 300 x 300mm',     quantity: 260, reorderPoint: 100, price: 1.85,   supplier: 'Meridian Packaging',  bin: 'E-01-1', categoryName: 'Packaging' },
  { sku: 'PKG-9024', name: 'Pallet Wrap 500mm x 300m — Clear',         quantity: 38,  reorderPoint: 24,  price: 12.40,  supplier: 'Meridian Packaging',  bin: 'E-01-4', categoryName: 'Packaging' },
  { sku: 'PKG-9031', name: 'Polyester Strapping 16mm — 1000m Coil',    quantity: 5,   reorderPoint: 12,  price: 67.00,  supplier: 'Meridian Packaging',  bin: 'E-02-2', categoryName: 'Packaging' },

  { sku: 'ADH-4401', name: 'Structural Sealant 290ml — Grey',          quantity: 84,  reorderPoint: 36,  price: 8.30,   supplier: 'Northgate Supply Co', bin: 'B-03-2', categoryName: 'Adhesives' },
  { sku: 'ADH-4460', name: 'Threadlocker, Medium Strength — 50ml',     quantity: 11,  reorderPoint: 15,  price: 16.75,  supplier: 'Northgate Supply Co', bin: 'B-03-6', categoryName: 'Adhesives' },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  await Category.deleteMany({})
  await Item.deleteMany({})

  await User.updateOne(
    { username: seedUser.username },
    {
      $set: {
        email: seedUser.email,
        password: await bcrypt.hash(seedUser.password, 10),
        role: seedUser.role,
        verified: true,
        verificationCode: null,
      },
    },
    { upsert: true }
  )
  console.log(`Seed user ready: ${seedUser.username} / ${seedUser.password}`)

  const createdCategories = await Category.insertMany(categories)
  const categoryMap = Object.fromEntries(createdCategories.map((c) => [c.name, c._id]))

  const items = itemsData.map(({ categoryName, ...rest }) => ({
    ...rest,
    categoryId: categoryMap[categoryName] || null,
  }))

  await Item.insertMany(items)
  console.log(`Seeded ${categories.length} categories and ${items.length} items.`)
  await mongoose.disconnect()
}

seed().catch((err) => { console.error(err); process.exit(1) })

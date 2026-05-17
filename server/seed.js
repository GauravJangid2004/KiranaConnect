/**
 * SEED SCRIPT — Run: npm run seed
 * Creates demo wholesaler + 2 shop owners + 8 realistic products
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';

const PRODUCTS = [
  { name: 'Basmati Rice', category: 'Grains',     unit: 'kg',    stock: 2000, maxStock: 2000, moq: 25, basePrice: 68,  imageEmoji: '🍚', imageUrl: '/images/products/basmati-rice.png', tiers: [{ minQty: 50, pricePerUnit: 65 }, { minQty: 100, pricePerUnit: 62 }] },
  { name: 'Atta (Wheat Flour)', category: 'Grains', unit: 'kg',  stock: 1500, maxStock: 2000, moq: 20, basePrice: 32,  imageEmoji: '🌾', imageUrl: '/images/products/wheat-flour.png', tiers: [{ minQty: 50, pricePerUnit: 30 }, { minQty: 100, pricePerUnit: 28 }] },
  { name: 'Chana Dal',    category: 'Pulses',     unit: 'kg',    stock: 800,  maxStock: 1500, moq: 10, basePrice: 75,  imageEmoji: '🫘', imageUrl: '/images/products/chana-dal.png', tiers: [{ minQty: 25, pricePerUnit: 72 }, { minQty: 50, pricePerUnit: 68 }] },
  { name: 'Toor Dal',     category: 'Pulses',     unit: 'kg',    stock: 600,  maxStock: 1500, moq: 10, basePrice: 95,  imageEmoji: '🟡', imageUrl: '/images/products/toor-dal.png', tiers: [{ minQty: 25, pricePerUnit: 90 }, { minQty: 50, pricePerUnit: 85 }] },
  { name: 'Sunflower Oil',category: 'Oils',       unit: 'liter', stock: 600,  maxStock: 1000, moq: 15, basePrice: 110, imageEmoji: '🫙', imageUrl: '/images/products/sunflower-oil.png', tiers: [{ minQty: 30, pricePerUnit: 105 }, { minQty: 60, pricePerUnit: 99 }] },
  { name: 'Mustard Oil',  category: 'Oils',       unit: 'liter', stock: 400,  maxStock: 1000, moq: 10, basePrice: 130, imageEmoji: '🛢️', imageUrl: '/images/products/mustard-oil.png', tiers: [{ minQty: 25, pricePerUnit: 125 }, { minQty: 50, pricePerUnit: 120 }] },
  { name: 'Sugar',        category: 'Sweeteners', unit: 'kg',    stock: 3000, maxStock: 3000, moq: 50, basePrice: 42,  imageEmoji: '🍬', imageUrl: '/images/products/sugar.png', tiers: [{ minQty: 100, pricePerUnit: 40 }, { minQty: 200, pricePerUnit: 38 }] },
  { name: 'Iodized Salt', category: 'Condiments', unit: 'kg',    stock: 2000, maxStock: 2000, moq: 20, basePrice: 12,  imageEmoji: '🧂', imageUrl: '/images/products/iodized-salt.png', tiers: [{ minQty: 50, pricePerUnit: 11 }, { minQty: 100, pricePerUnit: 10 }] },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kiranaconnect');

  await User.deleteMany({});
  await Product.deleteMany({});
  console.log('🗑️  Cleared existing data');

  const wholesaler = await User.create({
    name: 'Ramesh Gupta', phone: '9876543210', password: 'password123',
    role: 'wholesaler', shopName: 'Gupta Wholesale Traders', district: 'Jaipur',
    address: 'Sindhi Camp, Jaipur', gstNumber: '08ABCDE1234F1Z5',
  });

  await User.create([
    { name: 'Suresh Kumar', phone: '9111111111', password: 'password123', role: 'shopOwner', shopName: 'Kumar General Store', district: 'Jaipur', address: 'Mansarovar, Jaipur' },
    { name: 'Priya Sharma', phone: '9222222222', password: 'password123', role: 'shopOwner', shopName: 'Sharma Kirana Bhandar', district: 'Jaipur', address: 'Vaishali Nagar, Jaipur' },
  ]);

  await Product.create(PRODUCTS.map(p => ({ ...p, wholesalerId: wholesaler._id })));

  console.log('\n✅ Database seeded successfully!\n');
  console.log('📋 Demo Credentials:');
  console.log('   🏭 Wholesaler: phone=9876543210  password=password123');
  console.log('   🏪 ShopOwner1: phone=9111111111  password=password123');
  console.log('   🏪 ShopOwner2: phone=9222222222  password=password123\n');

  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });

/**
 * PRODUCT MODEL — Member 2 (Redis Cache + Product Catalogue)
 *
 * Tiered pricing: each product can have multiple pricing slabs.
 * Example: Basmati Rice  base ₹68/kg  |  50+ ₹65  |  100+ ₹62
 * The getPriceForQty() method finds the best applicable tier.
 *
 * Stock field uses atomic $inc + $gte for oversell prevention (Member 3's responsibility)
 * but the schema is shared across the project.
 */
import mongoose from 'mongoose';

const tierSchema = new mongoose.Schema({
  minQty:       { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
  wholesalerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String, required: true },
  category:     { type: String, required: true },
  unit:         { type: String, default: 'kg' },
  // Stock uses atomic $inc + $gte for oversell prevention — no application-level locking needed
  stock:        { type: Number, required: true, min: 0 },
  moq:          { type: Number, required: true }, // minimum order quantity
  basePrice:    { type: Number, required: true },
  tiers:        [tierSchema],                     // slab-based tiered pricing
  imageEmoji:   { type: String, default: '📦' },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

// Compute the best applicable tier price for a given quantity
productSchema.methods.getPriceForQty = function (qty) {
  const best = this.tiers
    .filter(t => qty >= t.minQty)
    .sort((a, b) => b.minQty - a.minQty)[0];
  return best ? best.pricePerUnit : this.basePrice;
};

export default mongoose.model('Product', productSchema);

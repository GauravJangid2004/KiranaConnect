import mongoose from 'mongoose';

const tierSchema = new mongoose.Schema(
  {
    minQty: { type: Number, required: true },
    price:  { type: Number, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    category:    { type: String, required: true },
    unit:        { type: String, default: 'kg' },
    stock:       { type: Number, default: 0, min: 0 },
    minOrderQty: { type: Number, default: 1 },
    tiers:       { type: [tierSchema], validate: (v) => v.length >= 1 },
    wholesaler:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);

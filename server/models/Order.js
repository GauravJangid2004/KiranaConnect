import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity:     { type: Number, required: true },
  priceAtOrder: { type: Number, required: true }, // price snapshot — immutable after creation
}, { _id: false });

const orderSchema = new mongoose.Schema({
  shopOwnerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wholesalerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:        [orderItemSchema],
  totalAmount:  { type: Number, required: true },
  status: {
    type:    String,
    enum:    ['pending', 'batched', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending',
  },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  notes:   String,
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);

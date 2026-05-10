import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['shopOwner', 'wholesaler'], required: true },
    shopName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);

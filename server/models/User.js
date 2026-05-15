import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  phone:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  // Dual-role system: JWT payload carries role claim, guards use it
  role:      { type: String, enum: ['shopOwner', 'wholesaler'], required: true },
  shopName:  { type: String, required: true },
  district:  { type: String, required: true },
  address:   String,
  gstNumber: String, // wholesalers only
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);

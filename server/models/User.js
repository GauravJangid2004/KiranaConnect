import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['shopOwner', 'wholesaler'], required: true },
    shopName: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    gstNumber: { type: String, trim: true, uppercase: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function savePassword(next) {
  try {
    if (this.isModified('phone')) {
      this.phone = this.phone.replace(/\D/g, '');
    }

    if (!this.isModified('password')) {
      return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);

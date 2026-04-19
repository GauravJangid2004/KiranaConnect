import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{10}$/, 'Phone number must contain exactly 10 digits'],
    },
    password: { type: String, required: true, select: false, minlength: 8 },
    role: { type: String, enum: ['shopOwner', 'wholesaler'], required: true },
    shopName: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      validate: {
        validator(value) {
          if (this.role !== 'wholesaler') return !value;
          if (!value) return true;
          return /^[0-9A-Z]{15}$/.test(value);
        },
        message: 'GST number must be 15 alpha-numeric characters for wholesalers',
      },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function savePassword(next) {
  try {
    if (this.isModified('phone')) {
      this.phone = this.phone.replace(/\D/g, '');
    }

    if (this.role !== 'wholesaler') {
      this.gstNumber = '';
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

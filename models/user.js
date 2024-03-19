const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstname: { type: String, default: 'default' },
  lastname: { type: String, default: 'default' },
  LicenseNo: { type: String, default: 'default' },
  Age: { type: Number, default: 0 },
  Username: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  UserType: { type: String, required: true, enum: ['Driver', 'Examiner', 'Admin'] },
  car_details: {
    make: { type: String, default: 'default' },
    model: { type: String, default: 'default' },
    year: { type: String, default: '0' },
    platno: { type: String, default: 'default' }
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('Password')) return next();
  this.Password = await bcrypt.hash(this.Password, 12);
  next();
});

module.exports = mongoose.model('User', userSchema);


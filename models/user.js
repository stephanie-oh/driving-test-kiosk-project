const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: String,
  lastname: String,
  "License No": String,
  Age: Number,
  username: String,
  password: String,
  car_details: {
    make: String,
    model: String,
    year: Number,
    platno: String,
  },
});

// const userSchema = new Schema({
//   firstname: 'default', 
//   lastname: 'default', 
//   LicenseNo: 'default', 
//   Age: 0, 
//   Username: 'demo', 
//   Password: 'demo', //Encrypted value 
//   UserType: 'Driver', 
//   car_details: { 
//     make: 'default', 
//     model: 'default', 
//     year: '0',
//     platno: 'default'
//   }
// });
const User = mongoose.model('User', userSchema);

module.exports = User;

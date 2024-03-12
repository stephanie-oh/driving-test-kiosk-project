const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: String,
  lastname: String,
  "License No": { type: String, unique: true },
  Age: Number,
  username: String,
  password: String,
  car_details: {
    make: String,
    model: String,
    year: Number,
    platno: String,
  },
  additionalDetails: {
    fname: String,
    lname: String,
    age: Number,
    dob: Date,
    lnum: String,
    cname: String,
    mname: String,
    year: Number,
    pnum: String,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

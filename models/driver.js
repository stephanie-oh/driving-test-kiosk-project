const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const driverSchema = new Schema({
    firstname: String,
    lastname: String,
    "License No": {type: String, unique: true},
    Age: Number,
    car_details: {
        make: String,
        model: String,
        year: Number,
        platno: String,
    },
});

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
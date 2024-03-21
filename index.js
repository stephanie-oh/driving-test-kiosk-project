const express = require('express');
const session = require('express-session');
const uuid = require('uuid');
const path = require('path');
const ejs = require('ejs');

const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user.js');
const Appointment = require('./models/appointment.js');
const generateSessionSecret = (req, res, next) => {
  req.session.secret = uuid.v4();
  next();
};
const { ensureAuthenticated, ensureIsDriver } = require('./middleware/access_control');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
  secret: 'pancake',
  resave: false,
  saveUninitialized: true,
}));

mongoose.connect('mongodb+srv://Stephanie:F0fcnUAVhtAQz1io@clusteroh.vnfhsuq.mongodb.net/gtest', {
  useNewUrlParser: true,
});


app.get('/', (req,res) => {
    res.render('index');
});

app.get('/login', (req,res) => {
    res.render('login');
});

app.get('/signup', (req,res) => {
    res.render('signup');
});


app.get('/g2test', ensureAuthenticated, ensureIsDriver, async (req, res) => {
  let { selectedDate } = req.query; // You might get this from a query parameter or another method
  selectedDate = selectedDate || new Date().toISOString().split('T')[0]; // Default to today if no date is selected

  const appointments = await Appointment.find({ 
      date: selectedDate,
      isTimeSlotAvailable: true 
  });

  res.render('g2_test', { appointments, selectedDate });
});

app.get('/ddash', ensureAuthenticated, (req, res) => {
  res.render('ddashboard', { userType: req.session.userType });
});

app.get('/adash', ensureAuthenticated, (req, res) => {
  res.render('adashboard', { userType: req.session.userType})
});

app.get('/appt', ensureAuthenticated, (req, res) => {
  res.render('appointment', { userType: req.session.userType})
});


app.post('/signup', async (req, res) => {
  try {
    const { username, password, userType } = req.body;
    const userExists = await User.findOne({ username: username });
    if (userExists) {
      return res.status(400).send('User already exists');
    }
    const user = new User({
      username: username,
      password: password,
      userType: userType,
    });
    await user.save();
    req.session.userId = user._id;
    req.session.userType = userType;

    // Redirect based on userType
    if (userType === 'Admin') {
      return res.redirect('/adash');
    } else {
      return res.redirect('/ddash');
    }
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).send('Error signing up user');
  }  
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      // User not found
      return res.status(401).send('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Passwords do not match
      return res.status(401).send('Invalid credentials');
    }

    // Assuming you're using session-based authentication
    req.session.userId = user._id;
    req.session.userType = user.userType;

    // Redirect based on userType
    if (user.userType === 'Admin') {
      res.redirect('/adash');
    } else if (user.userType === 'Driver') {
      res.redirect('/ddash');
    } else {
      // Handle other user types or default case
      res.redirect('/');
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send('Error during login');
  }
});


app.post('/update-details', async (req, res) => {
  const { firstname, lastname, Age, dob, LicenseNo, car_details } = req.body;

  // Assuming the user's ID is stored in session after they log in
  const userId = req.session.userId;

  try {
      await User.findByIdAndUpdate(userId, {
          $set: {
              firstname: firstname,
              lastname: lastname,
              Age: Age,
              dob: dob,
              LicenseNo: LicenseNo,
              "car_details.make": car_details.make,
              "car_details.model": car_details.model,
              "car_details.year": car_details.year,
              "car_details.platno": car_details.platno
          }
      }, { new: true }); // { new: true } option returns the document after update

      res.json({ message: 'User details updated successfully.' });
  } catch (error) {
      console.error('Error updating user details:', error);
      res.status(500).json({ error: 'Error updating user details.' });
  }
});

app.get('/gtest', ensureAuthenticated, ensureIsDriver, async (req, res) => {
  const userId = req.session.userId;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    // Render the gtest page with user details
    res.render('g_test', { user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching user details');
  }
}); 

app.post('/create-appointment', async (req, res) => {
  const { date, time } = req.body;

  try {
    const existingAppointment = await Appointment.findOne({ date, time });
    if (existingAppointment) {
      return res.status(400).json({ message: 'This appointment slot already exists.' });
    }

    const newAppointment = new Appointment({ date, time });
    await newAppointment.save();
    res.json({ message: 'Appointment slot created successfully.' });
  } catch (error) {
    console.error('Error creating appointment slot:', error);
    res.status(500).json({ message: 'Failed to create appointment slot.' });
  }
});

// Example route in your server setup
app.get('/appointments', ensureAuthenticated, async (req, res) => {
  const { date } = req.query; // Assuming the date is passed as a query parameter
  try {
      const appointments = await Appointment.find({ date: date, isTimeSlotAvailable: true });
      res.json(appointments);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching appointments.');
  }
});


// Example route in your server setup
app.post('/book-appointment', ensureAuthenticated, async (req, res) => {
  const { appointmentId } = req.body;
  const userId = req.session.userId; // Assuming you store userId in the session upon login

  try {
      const appointment = await Appointment.findByIdAndUpdate(appointmentId, { isTimeSlotAvailable: false }, { new: true });
      if (!appointment) {
          return res.status(404).send('Appointment not found or already booked.');
      }

      await User.findByIdAndUpdate(userId, { appointmentId: appointment._id });

      res.json({ message: 'Appointment booked successfully.', appointment });
  } catch (error) {
      console.error(error);
      res.status(500).send('Error booking the appointment.');
  }
});

app.listen(4000, () => {
    console.log('App listening on port 4000');
});
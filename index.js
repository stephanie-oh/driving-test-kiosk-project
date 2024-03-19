const express = require('express');
const session = require('express-session');
const uuid = require('uuid');
const path = require('path');
const ejs = require('ejs');

const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user.js');
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

// app.get('/ddash', (req,res) => {
//     res.render('ddashboard');
// });

// app.get('/gtest', (req,res) => {
//     res.render('g_test');
// });

// app.get('/g2test', (req,res) => {
//     res.render('g2_test');
// });

app.get('/g2test', ensureAuthenticated, ensureIsDriver, (req, res) => {
  res.render('g2_test');
});


// app.get('/gtest', ensureAuthenticated, ensureIsDriver, (req, res) => {
//   // Logic to display gpage
//   res.send('G Page - Accessible to drivers');
// });

app.get('/ddash', ensureAuthenticated, (req, res) => {
  res.render('ddashboard', { userType: req.session.userType });
});



app.post('/signup', async (req, res) => {
  try {
    const { username, password, userType } = req.body;
    const userExists = await User.findOne({ Username: username });
    if (userExists) {
      return res.status(400).send('User already exists');
    }
    const user = new User({
      Username: username,
      Password: password, // Will be hashed in the pre-save middleware
      UserType: userType,
    });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error signing up user');
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ Username: username });
  if (user && await bcrypt.compare(password, user.Password)) {
    req.session.userId = user.id;
    req.session.userType = user.UserType;
    res.redirect('/ddash'); // Adjust as needed
  } else {
    res.status(401).send('Invalid credentials');
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



app.listen(4000, () => {
    console.log('App listening on port 4000');
});
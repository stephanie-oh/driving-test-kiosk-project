const express = require('express');
const path = require('path');
const ejs = require('ejs');

const app = new express();
const mongoose = require('mongoose');
const User = require('./models/user.js');


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Connect to MongoDB
mongoose.connect('mongodb+srv://Stephanie:F0fcnUAVhtAQz1io@clusteroh.vnfhsuq.mongodb.net/gtest', {
  useNewUrlParser: true,
});


app.get('/', (req,res) => {
    // res.sendFile(path.resolve(__dirname, 'pages/index.html'));
    res.render('index');
});

app.get('/login', (req,res) => {
    // res.sendFile(path.resolve(__dirname, 'pages/login.html'));
    res.render('login');
});

app.get('/signup', (req,res) => {
    // res.sendFile(path.resolve(__dirname, 'pages/signup.html'));
    res.render('signup');
});

app.get('/ddash', (req,res) => {
    // res.sendFile(path.resolve(__dirname, 'pages/ddashboard.html'));
    res.render('ddashboard');
});

app.get('/gtest', (req,res) => {
    // res.sendFile(path.resolve(__dirname, 'pages/g_test.html'));
    res.render('g_test');
});

app.get('/g2test', (req,res) => {
    // res.sendFile(path.resolve(__dirname, 'pages/g2_test.html'));
    res.render('g2_test');
});

app.post('/g2test', async (req, res) => {
    try {
      // Collect data from the request body
      const { fname, lname, lnum, age, cname, mname, year, pnum } = req.body;
  
      // Create a user object
      const user = new User({
        firstname: fname,
        lastname: lname,
        "License No": lnum,
        Age: age,
        car_details: {
          make: cname,
          model: mname,
          year: year,
          platno: pnum,
        },
      });
  
      // Save the user to the database
      await user.save();
  
      // Respond with success message or redirect as needed
      res.json({ message: 'User details saved successfully' });
    } catch (error) {
      console.error('Error saving user details:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.get('/gtest/search', async (req, res) => {
    try {
      const licenseNumber = req.query.lnum;
  
      if (!licenseNumber) {
        return res.status(400).json({ message: 'License number is required' });
      }
  
      const user = await User.findOne({ "License No": licenseNumber });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(user);
    } catch (error) {
      console.error('Error searching for user:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

app.listen(4000, () => {
    console.log('App listening on port 4000');
});
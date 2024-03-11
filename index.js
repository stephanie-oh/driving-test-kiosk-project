const express = require('express');
const path = require('path');
const ejs = require('ejs');

const app = new express();
const mongoose = require('mongoose');
const Driver = require('./models/driver.js');
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

app.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Find the user in the database
      const user = await User.findOne({ username, password });
  
      if (user) {
        // Store user data in session
        req.session.user = user;
        res.redirect('/ddash'); // Redirect to the dashboard or any other page
      } else {
        res.send('<script>alert("Invalid username or password"); window.location.href="/login";</script>');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('<script>alert("Internal Server Error"); window.location.href="/login";</script>');
    }
  });

app.get('/signup', (req,res) => {
    // res.sendFile(path.resolve(__dirname, 'pages/signup.html'));
    res.render('signup');
});

app.post('/signup/users', async (req, res) => {
    try {
      // Extract data from the request body
      const { username, password } = req.body;
  
      // Create a new user instance
      const newUser = new User({
        username,
        password,
      });
  
      // Save the user to the database
      await newUser.save();
  
      // Respond with a success message
      res.send(
        '<script>alert("User signed up successfully!"); window.location.href="/login";</script>'
      );
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).send('<script>alert("Internal Server Error"); window.location.href="/signup";</script>');
    }
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

app.post('/g2_test/submit', async (req, res) => {
    try {
        const { fname, lname, lnum, age, cname, mname, year, pnum } = req.body;

        const driver = await Driver.create({
            firstname: fname,
            lastname: lname,
            "License No": lnum,
            Age: age,
            car_details: {
                make: cname,
                model: mname,
                year: year,
                platno: pnum,
            }
        });

        console.log(driver);
        res.status(200).json({ message: "Data saved successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
  
app.get('/gtest/search', async (req, res) => {
    try {
        const licenseNumber = req.query.lnum;

        if (!licenseNumber) {
            return res.status(400).json({ message: 'License number is required' });
        }

        const driver = await Driver.findOne({ "License No": licenseNumber });

        if (!driver) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(driver);
    } catch (error) {
        console.error('Error searching for user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/gtest/update', async (req, res) => {
    try {
        const updatedData = req.body; // Assuming the request body contains the updated data

        // Perform the update in the database based on the license number
        const result = await Driver.updateOne({ "License No": updatedData.licenseNumber }, { $set: updatedData });

        if (result.nModified === 0) {
            return res.status(404).json({ message: 'User not found or no changes made' });
        }

        res.json({ message: 'Update successful' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.listen(4000, () => {
    console.log('App listening on port 4000');
});
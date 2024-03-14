const express = require('express');
const session = require('express-session');
const uuid = require('uuid');
const path = require('path');
const ejs = require('ejs');

const app = new express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user.js');
const generateSessionSecret = (req, res, next) => {
  req.session.secret = uuid.v4(); // Generate a new UUID as the session secret
  next();
};

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

app.use(generateSessionSecret);

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


app.post('/signup', async (req, res) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const newUser = new User({
    username: req.body.username.trim(),
    password: hashedPassword,
    });

    console.log('Hashed Password:', hashedPassword);

    const savedUser = await newUser.save();

    res.status(201).json({ message: 'User signed up successfully', user: savedUser });
  } catch (error) {
    res.status(500).json({ error: 'Error signing up user' });
  }
});

app.post('/login', async (req, res) => {
  try {
      const { username, password } = req.body;

      const user = await User.findOne({ username });

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      console.log('Received Password (Hashed):', hashedPassword);
      console.log('Stored Password:', user.password);

      const passwordMatch = await bcrypt.compare(password.trim(), user.password);

      if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid password' });
      }

      req.session.user = {
        username: user.username,
        userId: user._id,
      };

      res.status(200).json({ message: 'Login successful', username: user.username, userId: user._id });
  } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: 'Error during login' });
  }
});

app.listen(4000, () => {
    console.log('App listening on port 4000');
});
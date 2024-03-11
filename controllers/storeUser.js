const User = require('../models/user');
const path = require('path');

module.exports = (req, res) => {
    User.create(req.body, (error, user) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/');
        }
    });
};

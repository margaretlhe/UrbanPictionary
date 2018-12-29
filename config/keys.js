require('dotenv').config();

exports.firebase_admin = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD
};
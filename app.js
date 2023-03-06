const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

const cors = require('cors');
app.use(
    cors({
        origin: ['https://architectinsider.in', 'http://localhost:3000'],
        credentials: true,
        withCredentials: true
    })
);

const dotenv = require('dotenv');
require("dotenv").config();
dotenv.config({ path: "./config.env"});

const PORT = process.env.PORT || 5000; //local host k liye
// const PORT = process.env.PORT; //deploy k liye

// const accountSid = process.env.ACCOUNT_SID;
// const authToken = process.env.AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);

// const JWT_AUTH_TOKEN = process.env.JWT_AUTH_TOKEN;
// const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;

// const smsKey = process.env.SMS_SECRET_KEY;

const mongodb = require("./mongoDB");
mongodb();

app.use(express.json());
app.use(cookieParser());
app.use(require('./router/auth'));

app.listen(PORT, () => {
    console.log(`Server is live at port ${PORT}`);
});
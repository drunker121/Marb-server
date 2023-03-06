const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

require("dotenv").config();
// dotenv.config({ path: "../config.env"});

const {User, Contactmessage, Enquiry_Message} = require('../model/userDetails');

// const accountSid = process.env.ACCOUNT_SID;
const accountSid = 'ACbc760d96dce4b97dbef637fc46c8918f';
// const authToken = process.env.AUTH_TOKEN;
const authToken = '486bc9fc6ea6e4b4e9144e24833b79f9';
const client = require('twilio')(accountSid, authToken);

// const JWT_AUTH_TOKEN = process.env.JWT_AUTH_TOKEN;
const JWT_AUTH_TOKEN = 'aec8a58af1e2268a288e9f2328682f8f4f168e224d2fbf03546c496a9988d9abe19ee56d5222e3a12ae0d67db599168b31e17467bf0c57a5ffff6864f5906e3d';
// const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;
const JWT_REFRESH_TOKEN = '524039eb5a4dc5cdf267f35c46dcb8f009abaee7ac37e72244df7f9291a01e47fc0fa9906f015609b0e5cf53f935a73ba4c77f248ef1bda01f784504ae777541';
let refreshTokens = [];

// const smsKey = process.env.SMS_SECRET_KEY;
const smsKey = 'e0ea6d1d2c84b03f5b073656da2ae10f44c7a0ad3519c13781fb63945d61f9154e090f6374ab703bb3048bfc6456816744636489d44659703fdfc68495f6b763';

router.get('/' , (req, res) => {
    res.send(`Server is live here`);
});

router.get('/test' , (req, res) => {
    res.send(`Test success`);
})

router.post('/products', async (req, res) => {
    const {name, email, phone_number, city} = req.body;

    if ( !name || !email || !phone_number || !city ) { 
        return res.status(422).json({error: "Please fill the entries"});
    }

    try {

        const userExist = await User.findOne({ email: email});

        if (userExist) {
            return res.status(422).json({ error: "Email already exist" });
        }

        const user = new User({ name, email, phone_number, city });

        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.log(err);
    }
})


router.post('/login' , async (req, res) => {
    const { phone_number} = req.body;
    
    if ( !phone_number ) {
        return res.status(422).json({error: "Please Enter you phone number"});
    }
    
    try {
        const alreadyUser = await User.findOne({phone_number: phone_number});
        if ( alreadyUser ) {
            return res.status(202).json({ status: "User found" });
        }
        else{
            return res.status(202).json({ status: "User not found"});
        }
        
    } catch(err) {
        console.log(err);
    }
});

router.post('/sendotp' , async(req, res) => {
    const { phone_number } = req.body;
    const phone = +91 + phone_number;
    const otp = Math.floor(100000 + Math.random()*900000);
    const ttl = 2*60*1000;
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;
    const hash = crypto.createHmac('sha256' , smsKey).update(data).digest('hex');
    const fullHash = `${hash}.${expires}`;

    client.messages.create({
        body: `Your one time Log In Password for MarbleGram is ${otp}`,
        from: +12706370017,
        to: phone
    }).then((messages) => console.log(messages)).catch((err) => console.error(err));

    res.status(202).send({message : "OTP sent successfully" , phone, hash:fullHash, otp })
})

router.post('/verifyotp' , async(req, res) => {
    const phone = req.body.phone;
    const hash = req.body.hash;
    const otp = req.body.otp;
    let [ hashValue, expires ] = hash.split('.');

    let now = Date.now();
    if ( now > parseInt(expires)) {
        return res.status(504).send({msg: "Timeout Please try again" })
    }
    const data = `${phone}.${otp}.${expires}`;
    const newCalculatedHash = crypto.createHmac('sha256', smsKey).update(data).digest('hex');

    if ( newCalculatedHash === hashValue ) {
        console.log('hi');
        const accessToken = jwt.sign( { data: phone} , JWT_AUTH_TOKEN, { expiresIn: '1h' });
        const refreshToken = jwt.sign( { data: phone} , JWT_REFRESH_TOKEN, { expiresIn: '1d' });
        // refreshTokens.push(refreshToken);
        // console.log(refreshToken, accessToken , "push hua ?");

        res
        .status(202)
        .cookie( 'accessToken' , accessToken, { expires : new Date(new Date().getTime() + 30 *1000) , httpOnly: true })
        .cookie( 'authSession', true, { expires: new Date(new Date().getTime() +30 *1000) })
        .cookie( 'refreshToken' , refreshToken,  { expires : new Date(new Date().getTime() + 3557600000), httpOnly: true})
        .cookie( 'refreshTokenID', true, { expires: new Date(new Date().getTime() + 3557600000) })
        .json("Device Confirmed")
        console.log('lodu');
    }
    else {
        return res.status(400).send({ verification: false, msg: "Incorrect OTP" })
    }
 })

 async function authenticateUser( req , res , next ) {
    const accessToken = req.cookies.accessToken;

    jwt.verify( accessToken, JWT_AUTH_TOKEN, async(err, phone) => {
        if ( phone ) {
            req.phone = phone;
            next();
        } else if ( err.message === "TokenExpiredError") {
            return res.send(403).send({ success: false, msg: `Access Token Expired` });
        } else {
            console.error(err);
            res.status(403).send({ err, msg: "User not authenticated" })
        }
    })
 }

 router.post( '/refresh', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    // console.log(refreshToken , "opbolte");
    // console.log(refreshTokens , 'opbolte[]');
    if ( !refreshToken ) return res.status(403).send({ msg: 'refresh Token not found, Please Log In again' });
    // if ( !refreshTokens.includes(refreshToken) ) return res.status(403).send({ msg: 'Refresh Token blocked, Log In again' });

    jwt.verify(refreshToken, JWT_REFRESH_TOKEN, (err, phone) => {
        if ( !err ) {
            const accessToken = jwt.sign({ data: phone }, JWT_AUTH_TOKEN, { expiresIn: '1d' });
            res
            .status(202)
            .cookie( 'accessToken' , accessToken, { expires : new Date(new Date().getTime() + 30 *1000), sameSite: 'strict' , httpOnly: true })
            .cookie( 'authSession', true, { expires: new Date(new Date().getTime() +30 *1000) })
            .send({ previousSessionExpiry: true, success: true })
        } else {
            return res.status(403).send({ success: false, msg: 'Invalid Refresh Token' });
        } 
    })

 })

 router.post( '/logout', (req, res) => {
    res.clearCookie('refreshToken').clearCookie('accessToken').clearCookie('authSession').clearCookie('refreshTokenID').send('User Logged Out');
 })

router.post('/contactus' , async(req, res) => {
    const {name, email, phone_number, query} = req.body;

    if ( !name || !email || !phone_number || !query ) {
        return res.status(202).json({ Error: "Please fill the entries" });
    }

    try {
        const newQuery = new Contactmessage({name, email, phone_number, query});
        await newQuery.save();
        res.status(201).json({Message: "Message Sent"})
    } catch (err) {
        console.log(err);
    }
    
});

router.post('/enquirycart' , async(req , res) => {
    const {Cart_Messages, name, email, phone_number, subject, enquiry_message} = req.body;

    if( !name || !email || !phone_number || !subject || !enquiry_message ) {
        return res.status(202).json({ Error: "Please fill al entries" });
    }

    try {
        const newEnquiry = new Enquiry_Message({ Cart_Messages, name, email, phone_number, subject, enquiry_message });
        await newEnquiry.save();
        res.status(201).json({ Message: "Enquiry submitted" });
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;
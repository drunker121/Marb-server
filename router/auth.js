const express = require('express');
const router = express.Router();


const {User, Contactmessage, Enquiry_Message} = require('../model/userDetails');
// router.get('/products' , (req, res) => {
//     res.send(`Give me registration details`);
// });

router.get('/' , (req, res) => {
    res.send(`Server is live here`);
});

//using promises
// router.post("/products", (req, res) => {

//     const {name , email , phone_number, city } = req.body;

//     if ( !name , !email , !phone_number , !city) {
//         return res.status(422).json({ "Error" : "Please fill the form"});
//     }

//     User.findOne({email : email})
//         .then((userExist) =>{
//             if(userExist) {
//                 return res.status(422).json({ error: "Email already exist" });
//             }

//             const user = new User({name , email , phone_number, city })

//             user.save().then(() => {
//                 res.status(201).json({ message: "User registered Successfully"});
//             }).catch((err) => res.status(500).json({ error: "Failed to Register" }));

//         }).catch(err => { console.log(err); });

// });

// async await

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
    const {email , phone_number} = req.body;
    
    if ( !email || !phone_number ) {
        return res.status(422).json({error: "Please fill the entries"});
    }
    
    try {
        const alreadyUser = await User.findOne({email: email});
        if ( alreadyUser ) {
            return res.status(202).json({ status: "Log In Successful" });
        }
        else{
            return res.status(202).json({ status: "User not found"});
        }
        
    } catch(err) {
        console.log(err);
    }
});

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
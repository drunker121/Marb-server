const mongoose = require('mongoose');

const userDetails = new mongoose.Schema({

    name: {
        type:String,
        required:true
    },
    email: {
        type: String,
        required: true
    },
    phone_number: {
        type:Number,
        required:true
    },
    city: {
        type: String,
        required: true
    }
}
);

const contactQuery = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type:String,
        required: true
    },
    phone_number: {
        type:String,
        required:true
    },
    query: {
        type: String,
        required: true
    }
});

const enquiryMessage = new mongoose.Schema({

    Cart_Messages:[[String]] ,
    name: {
        type: String,
        required: true
    },
    email: {
        type:String,
        required: true
    },
    phone_number: {
        type:String,
        required:true
    },
    subject: {
        type:String,
        required:true
    },
    enquiry_message:{
        type:String,
        required:true
    }
})

const Enquiry_Message = mongoose.model('enquirie' , enquiryMessage)
const Contactmessage = mongoose.model('contactQuerie', contactQuery);
const User = mongoose.model('USER', userDetails);
module.exports = {User, Contactmessage, Enquiry_Message};
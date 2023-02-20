const mongoose = require('mongoose');
const dotenv = require('dotenv');
require("dotenv").config();


const db=()=>{

    mongoose.set('strictQuery', true); //was throwing some error that's why
    mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to db');
    })
    .catch((err) => {
        console.log(err);
    })
};

module.exports=db;
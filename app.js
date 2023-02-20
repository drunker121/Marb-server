const express = require('express');
const app = express();

const cors = require('cors');
app.use(
    cors({
        credentials: true,
    })
);

const dotenv = require('dotenv');
require("dotenv").config();
dotenv.config({ path: "./config.env"});

const PORT = process.env.PORT;

const mongodb = require("./mongodb");
mongodb();

app.use(express.json());
app.use(require('./router/auth'));

app.listen(PORT, () => {
    console.log(`Server is live at port ${PORT}`);
})
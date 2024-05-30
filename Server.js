require('dotenv').config()
const express = require("express");
const app = express();
const registerRoute=require("./src/v1/auth/authRoutes")
const collabs=require("./src/v1/collabs/collabRoutes")
const usersProfile=require("./src/v1/usersProfile/usersProfileRoutes")


app.use(express.json());


app.use('/api/v1/register',registerRoute);

app.use('/api/v1/collabs',collabs);

app.use('/api/v1/profile',usersProfile);

app.listen(process.env.PORT, () => console.log(`app is running at port ${process.env.PORT}`));
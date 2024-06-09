require('dotenv').config()
const express = require("express");
const app = express();
const registerRoute=require("./src/v1/auth/authRoutes");
const collabs=require("./src/v1/collabs/collabRoutes");
const usersProfile=require("./src/v1/usersProfile/usersProfileRoutes");
const acceptedRequests=require("./src/v1/acceptedRequests/acceptedRequestRoutes");

app.use(express.json());


app.use('/v1/SignUp',registerRoute);

app.use('/v1',collabs);

app.use('/v1',usersProfile);

app.use('/v1',acceptedRequests);

app.listen(process.env.PORT, () => console.log(`app is running at port ${process.env.PORT}`));
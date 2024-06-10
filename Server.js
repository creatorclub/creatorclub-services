require('dotenv').config()
const express = require("express");
const app = express();
const registerRoute=require("./controller/auth/authRoutes");
const collabs=require("./controller/collabs/collabRoutes");
const usersProfile=require("./controller/usersProfile/usersProfileRoutes");
const collabsSwipeRequests=require("./controller/collabSwipeRequests/collabSwipeRequestsRoutes");
const creatorsSwipeRequests=require("./controller/creatorsSwipeRequests/creatorsSwipeRequestsRoutes");

app.use(express.json());


app.use('/v1/SignUp',registerRoute);

app.use('/v1',collabs);

app.use('/v1',usersProfile);

app.use('/v1',collabsSwipeRequests);

app.use('/v1',creatorsSwipeRequests);

app.listen(process.env.PORT, () => console.log(`app is running at port ${process.env.PORT}`));
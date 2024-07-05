require('dotenv').config()
const express = require("express");
const app = express();
const sequelize = require("./config/db");
const registerRoute=require("./controller/auth/authRoutes");
const collabs=require("./controller/collabs/collabRoutes");
const usersProfile=require("./controller/usersProfile/usersProfileRoutes");
const collabsSwipeRequests=require("./controller/collabSwipeRequests/collabSwipeRequestsRoutes");
const creatorsSwipeRequests=require("./controller/creatorsSwipeRequests/creatorsSwipeRequestsRoutes");
const chats=require("./controller/chats/chatsRoutes");
const feedback=require("./controller/feedbacks/feedbackRoutes");
const getAllNotification=require('./controller/notifications/getAllNotificationsRoutes');
const logs = require('./controller/logs/logsRoutes')

app.use(express.json());

sequelize.sync({ alter: true }).then(() => {
    console.log('Database & tables updated or created!');
  });

app.use('/v1/SignUp',registerRoute);

app.use('/v1',collabs);

app.use('/v1',usersProfile);

app.use('/v1',collabsSwipeRequests);

app.use('/v1',creatorsSwipeRequests);

app.use('/v1',chats);

app.use('/v1',feedback);

app.use('/v1',getAllNotification);


app.use('/v1',logs);


app.listen(process.env.PORT, () => console.log(`app is running at port ${process.env.PORT}`));
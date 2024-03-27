const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const authRoute = require("./Routes/AuthRoute");

app.use(
  cors({
    origin: `http://localhost:5174`,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());

app.use("/auth", authRoute);

module.exports = app;
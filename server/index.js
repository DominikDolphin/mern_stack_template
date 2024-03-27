const mongoose = require("mongoose");
const app = require('./app');
require("dotenv").config();
const { MONGO_URL, PORT } = process.env;

const MONGODB_URI = MONGO_URL || "mongodb://localhost:27017/local_dev";

mongoose
  .connect(MONGO_URL, {})
  .then(() => console.log(`MongoDB is  connected successfully via ${MONGO_URL ? "remote database" : "local database"}`))
  .then(() => app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`)))
  .catch((err) => console.error(err));
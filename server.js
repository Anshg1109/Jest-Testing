const express = require("express");
const connectDb = require("./config/dbConnection");
const dotenv = require("dotenv").config();

connectDb();
const app = express();

const port = process.env.PORT ||5000;

app.use(express.json());
app.use("/api", require("./routes/userRoutes"));

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = { app, server }; // Export both app and server
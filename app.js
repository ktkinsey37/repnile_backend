"use strict";

/** Express app for jobly. */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const animalsRoutes = require("./routes/animals");
const messagesRoutes = require("./routes/messages");
const eventsRoutes = require("./routes/events")
const itemsRoutes = require("./routes/items")
// const jobsRoutes = require("./routes/jobs")

const morgan = require("morgan");

const app = express();
app.use(express.static(__dirname + "/photos"));

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/events", eventsRoutes);
app.use("/items", itemsRoutes);
app.use("/animals", animalsRoutes);
app.use("/messages", messagesRoutes);
// app.use("/items", itemsRoutes)

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;

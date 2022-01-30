"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");

const router = new express.Router();
const multer = require("multer");

let storage = multer.diskStorage({
  destination: "../photos/",
  filename: function (req, file, cb) {
    //req.body is empty...
    //How could I get the new_file_name property sent from client here?
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

let upload = multer({ storage: storage });

router.post("/", ensureAdmin, upload.single("file"), (req, res, next) => {
  const file = req.file;
  console.log(file.filename);
  if (!file) {
    const error = new Error("No File");
    error.httpStatusCode = 400;
    return next(error);
  }

  res.json({ fileName: file.fileName });
});

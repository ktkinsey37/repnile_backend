"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Event = require("../models/events");

const eventUpdateSchema = require("../schemas/eventUpdate.json");
// const eventSearchSchema = require("../schemas/eventSearch.json");
const eventNewSchema = require("../schemas/eventNew.json");

const router = new express.Router();
const multer = require("multer");


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: admin
 */
// const multer = require("multer");

let storage = multer.diskStorage({
  destination: "./photos/",
  filename: function (req, file, cb) {
    //req.body is empty...
    //How could I get the new_file_name property sent from client here?
    cb(null, Date.now() + file.originalname.replace(/ /g, ""));
  },
});

let upload = multer({ storage: storage });

router.post(
  "/",
  ensureAdmin,
  upload.single("imgUrl"),
  async (req, res, next) => {
    try {
      console.log(req.body, "here is EVENT REQ.BODY")
      req.body["imgUrl"] = req.file.filename ? req.file.filename : "";

      const validator = jsonschema.validate(req.body, eventNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const event = await Event.create(req.body);
      return res.status(201).json({ event });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const q = req.query;
  // arrive as strings from querystring, but we want as ints

  try {
    //   Don't need to validate because it's just getting all, searches can be added later
    // const validator = jsonschema.validate(q, animalSearchSchema);
    // if (!validator.valid) {
    //   const errs = validator.errors.map((e) => e.stack);
    //   throw new BadRequestError(errs);
    // }

    const events = await Event.getAll();
    return res.json({ events });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  =>  { animal }
 *
 *  Animal is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const event = await Event.get(req.params.id);
    return res.json({ event });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, eventUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const event = await Event.update(req.params.id, req.body);
    return res.json({ event });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Event.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

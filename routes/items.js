"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Item = require("../models/item");

const itemUpdateSchema = require("../schemas/itemUpdate.json");
const itemSearchSchema = require("../schemas/itemSearch.json");
const itemNewSchema = require("../schemas/itemNew.json");

const router = new express.Router();

/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: admin
 */
const multer = require("multer");

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
      console.log(req.body)
      req.body["imgUrl"] = req.file.filename ? req.file.filename : "";
      req.body["forSale"] = req.body["forSale"] == "true" ? true : false;

      const validator = jsonschema.validate(req.body, itemNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const item = await Item.create(req.body);
      return res.status(201).json({ item });
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
  if (q.minPrice !== undefined) q.minPrice = +q.minPrice;
  if (q.maxPrice !== undefined) q.maxPrice = +q.maxPrice;
  if (q.minWeight !== undefined) q.minWeight = +q.minWeight;
  if (q.maxWeight !== undefined) q.maxWeight = +q.maxWeight;

  try {
    const validator = jsonschema.validate(q, itemSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const items = await Item.findAll(q);
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  =>  { item }
 *
 *  Item is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const item = await Item.get(req.params.id);
    return res.json({ item });
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
    const validator = jsonschema.validate(req.body, itemUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const item = await Item.update(req.params.id, req.body);
    return res.json({ item });
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
    await Item.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Animal = require("../models/animal");

const animalUpdateSchema = require("../schemas/animalUpdate.json");
const animalSearchSchema = require("../schemas/animalSearch.json");
const animalNewSchema = require("../schemas/animalNew.json");

const router = new express.Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, animalNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const animal = await Animal.create(req.body);
    return res.status(201).json({ animal });
  } catch (err) {
    return next(err);
  }
});

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
  if (q.minAge !== undefined) q.minAge = +q.minAge;
  if (q.maxAge !== undefined) q.maxAge = +q.maxAge;
  if (q.minPrice !== undefined) q.minPrice = +q.minPrice;
  if (q.maxPrice !== undefined) q.maxPrice = +q.maxPrice;
  if (q.minWeight !== undefined) q.minWeight = +q.minWeight;
  if (q.maxWeight !== undefined) q.maxWeight = +q.maxWeight;

  try {
    const validator = jsonschema.validate(q, animalSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const animals = await Animal.findAll(q);
    return res.json({ animals });
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
    const animal = await Animal.get(req.params.id);
    return res.json({ animal });
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
    const validator = jsonschema.validate(req.body, animalUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const animal = await Animal.update(req.params.id, req.body);
    return res.json({ animal });
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
    await Animal.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
 
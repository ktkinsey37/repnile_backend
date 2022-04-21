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
const addParentageSchema = require("../schemas/parentageNew.json")

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
      req.body["imgUrl"] = req.file.filename ? req.file.filename : "";
      req.body["forSale"] = req.body["forSale"] == "true" ? true : false;

      const validator = jsonschema.validate(req.body, animalNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const animal = await Animal.create(req.body);
      return res.status(201).json({ animal });
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
  if (q.minAge !== undefined) q.minAge = +q.minAge;
  if (q.maxAge !== undefined) q.maxAge = +q.maxAge;
  if (q.minPrice !== undefined) q.minPrice = +q.minPrice;
  if (q.maxPrice !== undefined) q.maxPrice = +q.maxPrice;
  if (q.minWeight !== undefined) q.minWeight = +q.minWeight;
  if (q.maxWeight !== undefined) q.maxWeight = +q.maxWeight;

  try {
    const validator = jsonschema.validate(q, animalSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
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


router.get("/:id/parents", async function (req, res, next) {
  try {
    const parentsIds = await Animal.findParents(req.params.id);
    console.log(parentsIds, "thisis parentsids in getparetns")
    // let parents = 
    return res.json({ parentsIds });
  } catch (err) {
    return next(err);
  }
});

router.post("/parents", ensureAdmin, async (req, res, next) => {
    try {
      const validator = jsonschema.validate(req.body, addParentageSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      console.log(req.body, "this is reqbody in addparentage in the route")

      const parentRes = await Animal.addParentage(req.body);
      return res.status(201).json({ parentRes });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/:id",
  ensureAdmin,
  upload.array("imgCollection", 10),
  async (req, res, next) => {
    try {
      let reqFiles = [];
      for (let i = 0; i < req.files.length; i++) {
        reqFiles.push(req.files[i].filename)
      }

      console.log(reqFiles, req.params.id, "bodyt and id")
      // const validator = jsonschema.validate(req.body, animalNewSchema);
      // if (!validator.valid) {
      //   const errs = validator.errors.map((e) => e.stack);
      //   throw new BadRequestError(errs);
      // }

      const animalRes = await Animal.addImages(reqFiles, req.params.id);
      console.log(animalRes, "this is res")
      return res.status(201).json({ animalRes });
    } catch (err) {
      return next(err);
    }
  }
);

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
      const errs = validator.errors.map((e) => e.stack);
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

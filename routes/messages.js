"use strict";


// import { v4 as uuid } from "uuid";
const MessageThread = require("../models/messageThread");
const Message = require("../models/message");
const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");

const messageNewSchema = require("../schemas/messageNew.json");

const router = new express.Router();


router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, messageNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    req.body.messageThreadId = (req.body.sender == "dina") ? req.body.recipient : req.body.sender
    console.log(req.body, "this is req.body inside of post messages")

    const message = await Message.create(req.body);
    return res.status(201).json({ message });
  } catch (err) {
    return next(err);
  }
});



router.get("/", ensureAdmin, async function (req, res, next) {
  // const q = req.query;
  // arrive as strings from querystring, but we want as ints
  
  // const messagesRes = await Message.

  try {
    const messages = await Message.getAllMessages();
    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const messageThread = await MessageThread.getThreadAndMessages(req.params.id)
    return res.json({ messageThread });
  } catch (err) {
    return next(err);
  }
});

router.post("/:id", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, messageNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    console.log(req.params.id, "this is req.params.id inside of messages route")

    const messageThread = await MessageThread.getThreadAndMessages(req.params.id);

    await MessageThread.updateMessageThreadAlert(req.params.id)

    console.log(messageThread, "messagethread on retrieval")

    console.log(req.body.sender, req.body.recipient, req.body.messageText, req.params.id)
    
    const message = await Message.create(req.body)
    return res.json({ messageThread });
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

// router.patch("/:id", ensureAdmin, async function (req, res, next) {
//   try {
//     const validator = jsonschema.validate(req.body, companyUpdateSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map(e => e.stack);
//       throw new BadRequestError(errs);
//     }

//     const company = await Company.update(req.params.handle, req.body);
//     return res.json({ company });
//   } catch (err) {
//     return next(err);
//   }
// });

// /** DELETE /[handle]  =>  { deleted: handle }
//  *
//  * Authorization: admin
//  */

router.delete("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;

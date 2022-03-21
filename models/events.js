"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for animals */

class Event {
  /** Create an animal (from input form data), update the db, return animal.
   *
   */

  static async create({
    title,
    date,
    description
  }) {
    const result = await db.query(
      `INSERT INTO events
           (title, date, description)
           VALUES ($1, $2, $3)
           RETURNING id, title, date, description`,
      [
        title,
        date,
        description
      ]
    );
    const event = result.rows[0];

    return event;
  }

  /** Find all animals (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - name
   * - species
   * - weight
   * - birthDate
   * - sex
   * - coloration pattern
   * - primary color
   * - secondary color
   * - price
   * - for sale
   *
   * Returns list of animal objects [{ name, species, weight, birthDate, sex, colorationPattern, primaryColor, secondaryColor, price, forSale }, ...]
   * */

  static async getAll() {
    let query = `SELECT *
                 FROM events
                 ORDER BY date DESC;`;

    const eventsRes = await db.query(query);
    //console.log(animalsRes, "animalsRes")
    return eventsRes.rows;
  }

  /** Given an event id, return data about that particular event.
   *
   * Returns { id, title, date, description}
   *
   * Calls findParents and findChildren below
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const eventRes = await db.query(
      `SELECT id,
              title,
              date,
              description
           FROM events
           WHERE id = $1`,
      [id]
    );

    const event = eventRes.rows[0];

    if (!event) throw new NotFoundError(`No such event with id: ${id}`);

    // Maybe add parentage in herE?

    return event;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE events 
                      SET ${setCols} 
                      WHERE id = ${id} 
                      RETURNING title, date, description`;
    const result = await db.query(querySql, [...values, id]);
    const event = result.rows[0];

    if (!event) throw new NotFoundError(`No such event with id: ${id}`);

    console.log(
      event,
      "this is event right before return in event.js update"
    );
    return event;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM events
           WHERE id = $1
           RETURNING title`,
      [id]
    );
    const event = result.rows[0];

    if (!event)
      throw new NotFoundError(`No such event exists with id: ${id}`);
  }
}

module.exports = Event;

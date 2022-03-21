"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for animals */

class Item {

  /** Create an animal (from input form data), update the db, return animal.
   * 
   */

  static async create({ name,
                        type,
                        description,
                        stock,
                        price,
                        forSale,
                        imgUrl}) {

    const result = await db.query(
          `INSERT INTO items
           (name, type, description, stock, price, for_sale, img_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, name, type, description, stock, price, for_sale AS "forSale", img_url AS "imgUrl"`,
        [
          name,
          type,
          description,
          stock,
          price,
          forSale,
          imgUrl
        ],
    );
    const item = result.rows[0];

    return item;
  }

  /** Find all animals (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - name
   * - species
   * - weight
   * - age
   * - sex
   * - coloration pattern
   * - primary color
   * - secondary color
   * - price
   * - for sale
   * 
   * Returns list of animal objects [{ name, species, weight, age, sex, colorationPattern, primaryColor, secondaryColor, price, forSale }, ...]
   * */

  static async findAll(searchFilters = {}) {
    let query = `SELECT id,
                        name,
                        type,
                        description,
                        stock,
                        price,
                        for_sale AS "forSale",
                        img_url AS "imgUrl"
                 FROM items`;
    let whereExpressions = [];
    let queryValues = [];

    const { name=undefined, type=undefined, description=undefined, stock=undefined,
            maxPrice=undefined, minPrice=undefined, forSale=undefined } = searchFilters;

    // NEED TO ADD FILTER BY, POSSIBLY BY PASSING THROUGH AN OBJ WITH FITLERBY AND ASC/DESC BOOL?

    if (minPrice > maxPrice) {
      throw new BadRequestError("Min price cannot be greater than or equal to max");
    }

    // For each possible search term, add to whereExpressions and queryValues so
    // we can generate the right SQL

    if (name !== undefined) {
      queryValues.push(`%${name}%`);
      whereExpressions.push(`name ILIKE $${queryValues.length}`);
    }

    if (type !== undefined) {
      queryValues.push(`%${type}%`);
      whereExpressions.push(`type ILIKE $${queryValues.length}`);
    }

    if (description !== undefined) {
      queryValues.push(`%${description}%`);
      whereExpressions.push(`description ILIKE $${queryValues.length}`);
    }

    if (minPrice !== undefined) {
      queryValues.push(`%${minPrice}%`);
      whereExpressions.push(`age > $${queryValues.length}`);
    }

    if (maxPrice !== undefined) {
      queryValues.push(`%${maxPrice}%`);
      whereExpressions.push(`age < $${queryValues.length}`);
    }

    if (forSale !== undefined) {
      queryValues.push(`%${forSale}%`);
      whereExpressions.push(`for_sale ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY name";
    const itemsRes = await db.query(query, queryValues);
    return itemsRes.rows;
  }

  /** Given an animal id, return data about that particular animal.
   *
   * Returns { id, name, species, weight, age, sex, colorationPattern, primaryColor, secondaryColor, price, forSale, [...parents], [...children] }
   * 
   * Calls findParents and findChildren below
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const itemRes = await db.query(
      `SELECT id,
              name,
              type,
              description,
              stock,
              price,
              for_sale AS "forSale",
              img_url AS "imgUrl"
           FROM items
           WHERE id = $1`,
        [id]);

    const item = itemRes.rows[0];



    if (!item) throw new NotFoundError(`No such item`);
    return item;
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
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          forSale: "for_sale",
          imgUrl: "img_url"
        });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE items 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, name, type, description, stock, price, for_sale AS "forSale", img_url AS "imgUrl"`;
    const result = await db.query(querySql, [...values, id]);
    const animal = result.rows[0];

    if (!animal) throw new NotFoundError(`No such item with id: ${id}`);

    return animal;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM items
           WHERE id = $1
           RETURNING name`,
        [id]);
    const item = result.rows[0];

    if (!item) throw new NotFoundError(`No such item exists with id: ${id}`);
  }
}


module.exports = Item;

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

  static async findAll(searchFilters = {}) {
    let query = `SELECT id,
                        name,
                        species,
                        weight,
                        birth_date,
                        sex,
                        coloration_pattern AS "colorationPattern",
                        primary_color AS "primaryColor",
                        secondary_color AS "secondaryColor",
                        price,
                        for_sale AS "forSale",
                        img_url AS "imgUrl"
                 FROM animals`;
    let whereExpressions = [];
    let queryValues = [];

    const {
      name = undefined,
      species = undefined,
      minWeight = undefined,
      maxWeight = undefined,
      // minAge=undefined, maxAge=undefined,
      sex = undefined,
      colorationPattern = undefined,
      primaryColor = undefined,
      secondaryColor = undefined,
      maxPrice = undefined,
      minPrice = undefined,
      forSale = undefined,
    } = searchFilters;

    // NEED TO ADD FILTER BY, POSSIBLY BY PASSING THROUGH AN OBJ WITH FITLERBY AND ASC/DESC BOOL?

    if (minWeight >= maxWeight) {
      throw new BadRequestError(
        "Min weight cannot be greater than or equal to max"
      );
    }

    // if (minAge >= maxAge) {
    //   throw new BadRequestError("Min age cannot be greater than or equal to max");
    // }

    if (minPrice >= maxPrice) {
      throw new BadRequestError(
        "Min price cannot be greater than or equal to max"
      );
    }

    // For each possible search term, add to whereExpressions and queryValues so
    // we can generate the right SQL

    if (name !== undefined) {
      queryValues.push(`%${name}%`);
      whereExpressions.push(`name ILIKE $${queryValues.length}`);
    }

    if (species !== undefined) {
      queryValues.push(`%${species}%`);
      whereExpressions.push(`species ILIKE $${queryValues.length}`);
    }

    if (minWeight !== undefined) {
      queryValues.push(`%${minWeight}%`);
      whereExpressions.push(`weight < $${queryValues.length}`);
    }

    if (maxWeight !== undefined) {
      queryValues.push(`%${maxWeight}%`);
      whereExpressions.push(`weight > $${queryValues.length}`);
    }

    // if (minAge !== undefined) {
    //   queryValues.push(`%${minAge}%`);
    //   whereExpressions.push(`age > $${queryValues.length}`);
    // }

    // if (maxAge !== undefined) {
    //   queryValues.push(`%${maxAge}%`);
    //   whereExpressions.push(`age < $${queryValues.length}`);
    // }

    if (minPrice !== undefined) {
      queryValues.push(`%${minPrice}%`);
      whereExpressions.push(`price > $${queryValues.length}`);
    }

    if (maxPrice !== undefined) {
      queryValues.push(`%${maxPrice}%`);
      whereExpressions.push(`price < $${queryValues.length}`);
    }

    if (sex !== undefined) {
      queryValues.push(`%${sex}%`);
      whereExpressions.push(`sex ILIKE $${queryValues.length}`);
    }

    if (colorationPattern !== undefined) {
      queryValues.push(`%${colorationPattern}%`);
      whereExpressions.push(`coloration_pattern ILIKE $${queryValues.length}`);
    }

    if (primaryColor !== undefined) {
      queryValues.push(`%${primaryColor}%`);
      whereExpressions.push(`primary_color ILIKE $${queryValues.length}`);
    }

    if (secondaryColor !== undefined) {
      queryValues.push(`%${secondaryColor}%`);
      whereExpressions.push(`secondary_color ILIKE $${queryValues.length}`);
    }

    if (forSale !== undefined) {
      queryValues.push(`%${forSale}%`);
      whereExpressions.push(`for_sale ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY name;";
    //console.log(query, "****this is query", queryValues, "suqeryvalues")
    const animalsRes = await db.query(query, queryValues);
    //console.log(animalsRes, "animalsRes")
    return animalsRes.rows;
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
    const animalRes = await db.query(
      `SELECT id,
                  name,
                  species,
                  weight,
                  birth_date,
                  sex,
                  coloration_pattern AS "colorationPattern",
                  primary_color AS "primaryColor",
                  secondary_color AS "secondaryColor",
                  price,
                  for_sale AS "forSale",
                  img_url AS "imgUrl"
           FROM animals
           WHERE id = $1`,
      [id]
    );

    const animal = animalRes.rows[0];

    if (!animal) throw new NotFoundError(`No such animal with id: ${id}`);

    // Maybe add parentage in herE?

    return animal;
  }

  static async findParents(id) {
    const relationshipRes = await db.query(
      `SELECT parent_id AS "parentId"
       FROM parent_children
       WHERE child_id=$1`,
      [id]
    );

    const parentIds = relationshipRes.rows[0];

    if (!parentIds) throw new NotFoundError(`No parents`);

    return parentIds;
  }

  static async findChildren(id) {
    const relationshipRes = await db.query(
      `SELECT child_id AS "childId"
       FROM parent_children
       WHERE parent_id=$1`,
      [id]
    );

    const childrenIds = relationshipRes.rows[0];

    if (!childrenIds) throw new NotFoundError(`No parents`);

    return childrenIds;
  }

  // Adds a parent-child relationship by adding their respective IDs into table

  static async addParentage(parentId, childId) {
    const parentageRes = await db.query(
      `INSERT INTO parent_children
      (parent_id, child_id)
      VALUES ($1, $2)`,
      [parentId, childId]
    );
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
    const { setCols, values } = sqlForPartialUpdate(data, {
      birthDate: "birth_date",
      colorationPattern: "coloration_pattern",
      primaryColor: "primary_color",
      secondaryColor: "secondary_color",
      forSale: "for_sale",
      imgUrl: "img_url",
    });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE animals 
                      SET ${setCols} 
                      WHERE id = ${id} 
                      RETURNING title, date, description`;
    const result = await db.query(querySql, [...values, id]);
    const animal = result.rows[0];

    if (!animal) throw new NotFoundError(`No such animal with id: ${id}`);

    console.log(
      animal,
      "this is animal right before return in animal.js update"
    );
    return animal;
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

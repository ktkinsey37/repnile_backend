"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for animals */

class Animal {

  /** Create an animal (from input form data), update the db, return animal.
   * 
   */

  static async create({ name,
                        species,
                        weight,
                        age,
                        sex,
                        colorationPattern,
                        primaryColor,
                        secondaryColor,
                        price,
                        forSale,
                        imgUrl }) {

    const result = await db.query(
          `INSERT INTO animals
           (name, species, weight, age, sex, coloration_pattern, primary_color, secondary_color, price, for_sale, img_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING id, name, species, weight, age, sex, coloration_pattern AS "colorationPattern",
                     primary_color AS "primaryColor", secondary_color AS "secondaryColor",
                     price, for_sale AS "forSale", img_url AS "imgUrl"`,
        [
          name,
          species,
          weight,
          age,
          sex,
          colorationPattern,
          primaryColor,
          secondaryColor,
          price,
          forSale,
          imgUrl
        ],
    );
    const animal = result.rows[0];

    return animal;
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
    let query = `SELECT name,
                        species,
                        weight,
                        age,
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

    const { name=undefined, species=undefined, minWeight=undefined, maxWeight=undefined, minAge=undefined, maxAge=undefined,
            sex=undefined, colorationPattern=undefined, primaryColor=undefined, secondaryColor=undefined,
            maxPrice=undefined, minPrice=undefined, forSale=undefined } = searchFilters;

    // NEED TO ADD FILTER BY, POSSIBLY BY PASSING THROUGH AN OBJ WITH FITLERBY AND ASC/DESC BOOL?


    if (minWeight >= maxWeight) {
      throw new BadRequestError("Min weight cannot be greater than or equal to max");
    }

    if (minAge > maxAge) {
      throw new BadRequestError("Min age cannot be greater than or equal to max");
    }

    if (minPrice > maxPrice) {
      throw new BadRequestError("Min price cannot be greater than or equal to max");
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

    if (minAge !== undefined) {
      queryValues.push(`%${minAge}%`);
      whereExpressions.push(`age > $${queryValues.length}`);
    }

    if (maxAge !== undefined) {
      queryValues.push(`%${maxAge}%`);
      whereExpressions.push(`age < $${queryValues.length}`);
    }

    if (minPrice !== undefined) {
      queryValues.push(`%${minPrice}%`);
      whereExpressions.push(`age > $${queryValues.length}`);
    }

    if (maxPrice !== undefined) {
      queryValues.push(`%${maxPrice}%`);
      whereExpressions.push(`age < $${queryValues.length}`);
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

    query += " ORDER BY name";
    const companiesRes = await db.query(query, queryValues);
    return companiesRes.rows;
  }

  /** Given an animal id, return data about that particular animal.
   *
   * Returns { id, name, species, weight, age, sex, colorationPattern, primaryColor, secondaryColor, price, forSale, [...parents], [...children] }
   * 
   * Calls findParents and findChildren below
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
        [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    const jobsRes = await db.query(
          `SELECT id, title, salary, equity
           FROM jobs
           WHERE company_handle = $1
           ORDER BY id`,
        [handle],
    );

    company.jobs = jobsRes.rows;

    return company;
  }

  static async findParents(id){
    const relationshipRes = await db.query(
      `SELECT parent_id AS "parentId"
       FROM parent_children
       WHERE  = $1`,
    [handle]);

const company = companyRes.rows[0];

if (!company) throw new NotFoundError(`No company: ${handle}`);

const jobsRes = await db.query(
      `SELECT id, title, salary, equity
       FROM jobs
       WHERE company_handle = $1
       ORDER BY id`,
    [handle],
);

company.jobs = jobsRes.rows;

return company;

  }

  static async findChildren(id){
    const companyRes = await db.query(
      `SELECT handle,
              name,
              description,
              num_employees AS "numEmployees",
              logo_url AS "logoUrl"
       FROM companies
       WHERE handle = $1`,
    [handle]);

const company = companyRes.rows[0];

if (!company) throw new NotFoundError(`No company: ${handle}`);

const jobsRes = await db.query(
      `SELECT id, title, salary, equity
       FROM jobs
       WHERE company_handle = $1
       ORDER BY id`,
    [handle],
);

company.jobs = jobsRes.rows;

return company;

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

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Animal;

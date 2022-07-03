"use strict";

const db = require("../db");
const fs = require('fs')
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for animals */

class Animal {
  /** Create an animal (from input form data), update the db, return animal.
   *
   */

  static async create({
    name,
    species,
    weightInGrams,
    hatchDate,
    sex,
    morph,
    baseColor,
    pattern,
    price,
    priceWithPlan,
    forSale,
    breeder,
    imgUrl,
  }) {
    const result = await db.query(
      `INSERT INTO animals
           (name,
            species,
            weight_in_grams,
            hatch_date,
            sex,
            morph,
            base_color,
            pattern,
            price,
            price_with_plan,
            for_sale,
            breeder,
            img_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING id,
                      name,
                      species,
                      weight_in_grams AS "weightInGrams",
                      hatch_date,
                      sex,
                      morph,
                      base_color AS "baseColor",
                      pattern,
                      price,
                      price_with_plan AS "priceWithPlan",
                      for_sale AS "forSale",
                      breeder,
                      img_url AS "imgUrl"`,
      [
        name,
        species,
        weightInGrams,
        hatchDate,
        sex,
        morph,
        baseColor,
        pattern,
        price,
        priceWithPlan,
        forSale,
        breeder,
        imgUrl
      ]
    );
    const animal = result.rows[0];

    return animal;
  }

  static async addImages(
    reqFiles, id
  ) {

    console.log(reqFiles, id, "this is data in addImages")
    let res = []

    for (let i = 0; i < reqFiles.length ;i++) {
      const result = await db.query(
        `INSERT INTO animal_photos
             (parent_id, img_url)
             VALUES ($1, $2)
             RETURNING img_url AS imgUrl`,
        [
          id,
          reqFiles[i]
        ]
      );
      res.push(result.rows[0])
    };

    return res;
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
                        weight_in_grams AS "weightInGrams",
                        hatch_date,
                        sex,
                        morph,
                        base_color AS "baseColor",
                        pattern,
                        price,
                        price_with_plan AS "priceWithPlan",
                        for_sale AS "forSale",
                        breeder,
                        img_url AS "imgUrl"
                 FROM animals`;
    let whereExpressions = [];
    let queryValues = [];

    const {
      // name = undefined,
      // species = undefined,
      // minWeight = undefined,
      // maxWeight = undefined,
      // minAge=undefined, maxAge=undefined,
      // sex = undefined,
      morph = undefined
      // baseColor = undefined,
      // pattern = undefined,
      // maxPrice = undefined,
      // minPrice = undefined
    } = searchFilters;

    // NEED TO ADD FILTER BY, POSSIBLY BY PASSING THROUGH AN OBJ WITH FITLERBY AND ASC/DESC BOOL?

    // if (minWeight >= maxWeight) {
    //   throw new BadRequestError(
    //     "Min weight cannot be greater than or equal to max"
    //   );
    // }

    // if (minAge >= maxAge) {
    //   throw new BadRequestError("Min age cannot be greater than or equal to max");
    // }

    // if (minPrice >= maxPrice) {
    //   throw new BadRequestError(
    //     "Min price cannot be greater than or equal to max"
    //   );
    // }

    // For each possible search term, add to whereExpressions and queryValues so
    // we can generate the right SQL

    // if (name !== undefined) {
    //   queryValues.push(`%${name}%`);
    //   whereExpressions.push(`name ILIKE $${queryValues.length}`);
    // }

    // if (species !== undefined) {
    //   queryValues.push(`%${species}%`);
    //   whereExpressions.push(`species ILIKE $${queryValues.length}`);
    // }

    // if (minWeight !== undefined) {
    //   queryValues.push(`%${minWeight}%`);
    //   whereExpressions.push(`weight < $${queryValues.length}`);
    // }

    // if (maxWeight !== undefined) {
    //   queryValues.push(`%${maxWeight}%`);
    //   whereExpressions.push(`weight > $${queryValues.length}`);
    // }

    // if (minAge !== undefined) {
    //   queryValues.push(`%${minAge}%`);
    //   whereExpressions.push(`age > $${queryValues.length}`);
    // }

    // if (maxAge !== undefined) {
    //   queryValues.push(`%${maxAge}%`);
    //   whereExpressions.push(`age < $${queryValues.length}`);
    // }

    // if (minPrice !== undefined) {
    //   queryValues.push(`%${minPrice}%`);
    //   whereExpressions.push(`price > $${queryValues.length}`);
    // }

    // if (maxPrice !== undefined) {
    //   queryValues.push(`%${maxPrice}%`);
    //   whereExpressions.push(`price < $${queryValues.length}`);
    // }

    // if (sex !== undefined) {
    //   queryValues.push(`%${sex}%`);
    //   whereExpressions.push(`sex ILIKE $${queryValues.length}`);
    // }

    if (morph !== undefined) {
      queryValues.push(`%${morph}%`);
      whereExpressions.push(`morph ILIKE $${queryValues.length}`);
    }

    // if (baseColor !== undefined) {
    //   queryValues.push(`%${baseColor}%`);
    //   whereExpressions.push(`base_color ILIKE $${queryValues.length}`);
    // }

    // if (pattern !== undefined) {
    //   queryValues.push(`%${pattern}%`);
    //   whereExpressions.push(`pattern ILIKE $${queryValues.length}`);
    // }

    // if (forSale !== undefined) {
    //   queryValues.push(`%${forSale}%`);
    //   whereExpressions.push(`for_sale ILIKE $${queryValues.length}`);
    // }

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
              weight_in_grams AS "weightInGrams",
              hatch_date,
              sex,
              morph,
              base_color AS "baseColor",
              pattern,
              price,
              price_with_plan AS "priceWithPlan",
              for_sale AS "forSale",
              breeder,
              img_url AS "imgUrl"
          FROM animals
          WHERE id = $1`,
      [id]
    );

    const animal = animalRes.rows[0];

    const animalPhotosRes = await db.query(
      `SELECT img_url AS "imgUrl"
          FROM animal_photos
          WHERE parent_id = $1`,
      [id]
    );

    animal.photos = []

    for (let i = 0; i < animalPhotosRes.rows.length; i++){
      animal.photos.push(animalPhotosRes.rows[i].imgUrl)
    }

    console.log(animal)

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

    const parentIds = relationshipRes.rows;

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

  static async addParentage(data) {


    console.log(data, "this is data in add parentage")
    const parentageRes = await db.query(
      `INSERT INTO parent_children
      (parent_id, child_id, u_key)
      VALUES ($1, $2, $3)`,
      [data.parent, data.child, `${data.parent}, ${data.child}`]
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

  static async getBreeders() {
    const result = await db.query(
      `SELECT id,
              name,
              species,
              weight_in_grams AS "weightInGrams",
              hatch_date,
              sex,
              morph,
              base_color AS "baseColor",
              pattern,
              price,
              price_with_plan AS "priceWithPlan",
              for_sale AS "forSale",
              breeder,
              img_url AS "imgUrl"
           FROM animals
           WHERE breeder = true;`
    );
    console.log(result.rows, "this is getbreeders sql result")
    return result.rows
  }

  static async getForSale() {
    const result = await db.query(
      `SELECT id,
              name,
              species,
              weight_in_grams AS "weightInGrams",
              hatch_date,
              sex,
              morph,
              base_color AS "baseColor",
              pattern,
              price,
              price_with_plan AS "priceWithPlan",
              for_sale AS "forSale",
              breeder,
              img_url AS "imgUrl"
            FROM animals
            WHERE for_sale = true;`
    );
    console.log(result.rows, "this is getforsale sql result")
    return result.rows
    }
  static async getNotForSale() {
    const result = await db.query(
      `SELECT id,
              name,
              species,
              weight_in_grams AS "weightInGrams",
              hatch_date,
              sex,
              morph,
              base_color AS "baseColor",
              pattern,
              price,
              price_with_plan AS "priceWithPlan",
              for_sale AS "forSale",
              breeder,
              img_url AS "imgUrl"
            FROM animals
            WHERE for_sale = false;`
    );
    console.log(result.rows[0], "this is getnotforsale sql result")
    return result.rows
    }

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      hatchDate: "hatch_date",
      baseColor: "base_color",
      weightInGrams: "weight_in_grams",
      priceWithPlan: "price_with_plan",
      forSale: "for_sale",
      imgUrl: "img_url",
    });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE animals 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id,
                                name,
                                species,
                                weight_in_grams AS "weightInGrams",
                                hatch_date,
                                sex,
                                morph,
                                base_color AS "baseColor",
                                pattern,
                                price,
                                price_with_plan AS "priceWithPlan",
                                for_sale AS "forSale",
                                breeder,
                                img_url AS "imgUrl"`;
    const result = await db.query(querySql, [...values, id]);
    const animal = result.rows[0];

    if (!animal) throw new NotFoundError(`No such animal with id: ${id}`);

    console.log(
      animal,
      "this is animal right before return in animal.js update"
    );
    return animal;
  }

  static async removePhoto(imgUrl){

    const animalPhotosRes = await db.query(
      `DELETE
          FROM animal_photos
          WHERE img_url = $1
          RETURNING img_url AS imgUrl`,
      [imgUrl]
    );

      const path = '../photos/' + imgUrl

      fs.unlink(path, (err) => {
        if (err) {
          console.error(err)
          return
        }
      
        //file removed
      })
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {

    const basePath = '../photos/'

    const animalPhotosRes = await db.query(
      `SELECT img_url AS "imgUrl"
          FROM animal_photos
          WHERE parent_id = $1`,
      [id]
    );

    for (let i = 0; i < animalPhotosRes.rows.length; i++){

      const path = basePath + animalPhotosRes.rows[i].imgUrl

      fs.unlink(path, (err) => {
        if (err) {
          console.error(err)
          return
        }
      
        //file removed
      })
    }

    const result = await db.query(
      `DELETE
           FROM animals
           WHERE id = $1
           RETURNING name`,
      [id]
    );
    const animal = result.rows[0];

    if (!animal)
      throw new NotFoundError(`No such animal exists with id: ${id}`);
  }
}

module.exports = Animal;

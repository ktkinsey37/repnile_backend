"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for animals */

class MessageThread {

  /** Create an animal (from input form data), update the db, return animal.
   * 
   */

  static async create(uuid) {

    const result = await db.query(
          `INSERT INTO message_threads
           (uuid)
           VALUES ($1)
           RETURNING uuid, created_at AS "createdAt", updated_at AS "updatedAt", last_checked_at AS "lastCheckedAt"`,
        [
          uuid
        ],
    );

    return result;
  }

  /** Given an animal id, return data about that particular animal.
   *
   * Returns { id, name, species, weight, age, sex, colorationPattern, primaryColor, secondaryColor, price, forSale, [...parents], [...children] }
   * 
   * Calls findParents and findChildren below
   *
   * Throws NotFoundError if not found.
   **/

  static async getThreadAndMessages(uuid) {
    const res = await db.query(
          `SELECT uuid,
                  created_at AS "createdAt",
                  updated_at AS "updatedAt",
                  last_checked_at AS "lastCheckedAt"
           FROM message_threads
           WHERE uuid = $1`,
        [uuid]);

    const messageThread = res.rows[0];

    if (!messageThread) return undefined;

    const messagesRes = await db.query(
          `SELECT id, created_at AS "createdAt", sender, recipient, message_text AS "messageText"
           FROM messages
           WHERE message_thread_id = $1
           ORDER BY id`,
        [uuid],
    );

    messageThread.messages = messagesRes.rows;

    return messageThread;
  }

  static async updateMessageThreadAlert(uuid){
    const res = await db.query(
        `INSERT INTO message_threads (updated_at)
                VALUES (CURRENT_TIMESTAMP)
         WHERE uuid = $1`,
      [uuid]);

      const messageThread = res.rows[0];
  }

  static async updateMessageThreadChecked(uuid){
    const res = await db.query(
        `INSERT INTO message_threads (last_checked_at)
                VALUES (CURRENT_TIMESTAMP)
         WHERE uuid = $1`,
      [uuid]);

      const messageThread = res.rows[0];
  }

  static async getAllThreads(){
    const res = await db.query(
      `SELECT uuid,
              created_at AS "createdAt",
              updated_at AS "updatedAt",
              last_checked_at AS "lastCheckedAt"
       FROM message_threads
       ORDER BY created_at ASC`);

  }

  static async getUncheckedMessageThreads(){
    const res = await db.query(
      `SELECT * FROM message_threads
      WHERE updated_at > last_checked_at
      ORDER BY updated_at ASC`
    )
  }

  static async remove(uuid) {
    const result = await db.query(
          `DELETE
           FROM message_threads
           WHERE uuid = $1
           RETURNING uuid`,
        [uuid]);

        const messageThreadId = res.rows[0];

    if (!messageThreadId) throw new NotFoundError(`No such message thread exists with id: ${uuid}`);
  }
}


module.exports = MessageThread;

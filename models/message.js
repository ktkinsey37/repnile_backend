"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const MessageThread = require("./messageThread");

/** Related functions for messages */

class Message {

  /** Receive a message, check if a message thread already exists for it.
   * If not, create a message thread, if so, retrieve the existing one.
   * Create the message, linked to the message thread, and return the messagethread and message.
   * 
   */

  static async create({ from, to, messageText, messageThreadId }) {

    // Try to pull the message thread to either update it if exists, create it if not

    const messageThreadRes = await MessageThread.getThreadAndMessages(messageThreadId)

    let messageThread;

    messageThread = messageThreadRes.rows[0]
    
    if (!messageThread){
      const createThreadRes = await MessageThread.create(messageThreadId)
      messageThread = createThreadRes.rows[0]
      messageThreadId = messageThread.uuid
    }

    const messageResult = await db.query(
          `INSERT INTO messages
           (from, to, message_text, message_thread_id)
           VALUES ($1, $2, $3, $4)
           RETURNING id, created_at AS "createdAt", from, to, message_text AS "messageText", message_thread_id AS "messageThreadId`,
        [
          from,
          to,
          messageText,
          messageThreadId
        ],
    );
    const message = messageResult.rows[0];

    messageThread.messages = [message]

    return messageThread;
  }

  static async get(id){
    const messageRes = await db.query(`SELECT * FROM messages WHERE id = $1`,
    [uuid]);

    const message = messageRes.rows[0]
  }

  static async getAllMessages(){

    let uuids = [];
    let allMessageThreads = [];
    const allUuidRes = await db.query(`SELECT uuid FROM message_threads`)
    uuids = allUuidRes.rows

    for (i=0;i<uuids.length-1;i++){
      const messageThreadRes = await db.query(`SELECT * FROM messages WHERE uuid=$1 ORDER BY created_at DESC`, [uuids[i]])
      let messageThread = {"id": uuids[i], "messages": []}
      messageThread.messages.push(...messageThreadRes.rows)
    }

    return messageThread;

    // const messageRes = await db.query(`SELECT * FROM messages
    //                                    JOIN message_threads ON messages.message_thread_id=message_thread.uuid
    //                                    GROUP BY uuid
    //                                    ORDER BY message_thread.updated_at`)
  }

  static async delete(id){
    const messageRes = await db.query(`DELETE * FROM messages WHERE id = $1 RETURNING id`,
    [uuid]);

    const deletedMessageId = messageRes.rows[0]
  }
}


module.exports = Message;

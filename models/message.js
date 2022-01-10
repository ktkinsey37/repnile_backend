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

  static async create({ sender, recipient, messageText, messageThreadId }) {

    // Try to pull the message thread to either update it if exists, create it if not
    console.log(sender, recipient, messageText, messageThreadId, "create.message messagethreadid")

    const messageThreadRes = await MessageThread.getThreadAndMessages(messageThreadId)

    console.log(messageThreadRes, "mesagethreadres inside message.create")

    let messageThread;


    messageThread = messageThreadRes
    
    if (!messageThread){
      const createThreadRes = await MessageThread.create(messageThreadId)
      messageThread = createThreadRes.rows[0]
      console.log(messageThread, "this is messagethread on creaton")
      messageThreadId = messageThread.uuid
    }


    const messageResult = await db.query(
          `INSERT INTO messages
           (sender, recipient, message_text, message_thread_id)
           VALUES ($1, $2, $3, $4)
           RETURNING id, created_at AS "createdAt", sender, recipient, message_text AS "messageText", message_thread_id AS "messageThreadId"`,
        [
          sender,
          recipient,
          messageText,
          messageThreadId
        ],
    );

    const message = messageResult.rows[0];

    if (!message.messageThreadId){
      console.log(messageThread, "messagethread")
      message.messageThreadId = messageThreadId}
    console.log(message, "message")

    messageThread.messages = [message]

    return messageThread;
  }

  static async get(id){
    const messageRes = await db.query(`SELECT * FROM messages WHERE id = $1`,
    [uuid]);

    const message = messageRes.rows[0]
  }

  static async getAllMessages(){

    console.log("hitting get all messages")

    let uuids = [];
    let allMessageThreads = [];
    const allUuidRes = await db.query(`SELECT uuid FROM message_threads`)
    uuids = allUuidRes.rows.map((row) => row.uuid)
    console.log(uuids, "uuids")

    for (let i=0;i<uuids.length;i++){
      console.log("in the loop")
      const messageThreadRes = await db.query(`SELECT * FROM messages WHERE message_thread_id=$1 ORDER BY created_at DESC LIMIT 2`, [uuids[i]])
      let messageThread = {"id": uuids[i], "messages": []}
      console.log(messageThread, "in the loop")

      messageThread.messages.push(...messageThreadRes.rows)
      allMessageThreads.push(messageThread)
    }
    console.log(allMessageThreads, "allmessagethreads before returned")
    return allMessageThreads;

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

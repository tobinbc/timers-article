'use strict';
const { randomUUID } = require('crypto')
const { DynamoDB } = require('aws-sdk')
const dc = new DynamoDB.DocumentClient()

const TableName = process.env.TimestampTable

module.exports.handler = async (event) => {
  console.log(JSON.stringify(event))
  let body = ''
  switch (event.httpMethod) {
    case "POST": {
      const Item = {
        id: randomUUID(),
        timestamp: new Date().toISOString(),
      }
      await dc.put({
        TableName,
        Item
      }).promise()
      body = JSON.stringify(Item)
      break;
    }
    case 'GET': {
      const { Items } = await dc.scan({
        TableName,
      }).promise()
      body = Items.map(({ timestamp }) => timestamp).join("\n")
      break;
    }
    case "DELETE": {
      const { Items } = await dc.scan({
        TableName,
      }).promise()
      await Promise.all(Items.map(({ id }) => dc.delete({
        TableName,
        Key: {
          id
        }
      })))
      body = JSON.stringify({ deleted: Items.length })
      break;
    }
  }

  return {
    statusCode: 200,
    body
  };
};

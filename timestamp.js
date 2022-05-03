"use strict";
const { randomUUID } = require("crypto");
const { DynamoDB } = require("aws-sdk");
const dc = new DynamoDB.DocumentClient();

const TableName = process.env.TimestampTable;

module.exports.handler = async (event) => {
  console.log(JSON.stringify(event));
  const method = event && event.httpMethod ? event.httpMethod : "";

  let body = "";
  switch (method) {
    case "GET": {
      const { Items } = await dc
        .scan({
          TableName,
        })
        .promise();
      body = Items.map(({ timestamp }) => new Date(timestamp).valueOf()).join("\n");
      break;
    }
    case "DELETE": {
      const { Items } = await dc
        .scan({
          TableName,
        })
        .promise();
      await Promise.all(
        Items.map(({ id }) =>
          dc.delete({
            TableName,
            Key: {
              id,
            },
          }).promise()
        )
      );
      body = JSON.stringify({ deleted: Items.length });
      break;
    }
    case "POST":
    default: {
      // catch all direct invokes too.
      const Item = {
        id: randomUUID(),
        timestamp: new Date().toISOString(),
      };
      await dc
        .put({
          TableName,
          Item,
        })
        .promise();
      body = JSON.stringify(Item);
      break;
    }
  }

  return {
    statusCode: 200,
    body,
  };
};

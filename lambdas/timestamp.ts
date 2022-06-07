import { randomUUID }  from "crypto"
import { DynamoDB } from"aws-sdk"
const dc = new DynamoDB.DocumentClient();

const TableName = process.env.TimestampTable!;

export const handler = async (event:any) => {
  console.log(JSON.stringify(event));
  const method = event && event.httpMethod ? event.httpMethod : "POST"; // could be direct invoked

  let body = "";
  switch (method) {
    case "GET": {
      const { Items = [] } = await dc
        .scan({
          TableName,
        })
        .promise();
      body = Items.map(({ timestamp }) => new Date(timestamp).valueOf()).join("\n");
      break;
    }
    case "DELETE": {
      const { Items = [] } = await dc
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

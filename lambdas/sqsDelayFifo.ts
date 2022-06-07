import { SQSEvent } from "aws-lambda";
import { Lambda, SQS } from "aws-sdk";

const sqs = new SQS();
const lambda = new Lambda()

export const handler = async (event: SQSEvent) => {
  console.log(JSON.stringify(event));
  const current = event.Records[0].messageAttributes.messageDeduplicationId;
  await sqs
    .sendMessage({
      MessageDeduplicationId: String(+current + 1),
      MessageGroupId: "group",
      MessageBody: "",
      QueueUrl: process.env.queue!,
    })
    .promise();
    await lambda.invoke({
      FunctionName: process.env.function!,
    })
};

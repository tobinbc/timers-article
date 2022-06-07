import { CloudWatchEvents } from "aws-sdk";

const cloudwatch = new CloudWatchEvents();

const deleteCurrent = async () => {
  const { Rules = [] } = await cloudwatch
    .listRules({
      NamePrefix: "cloudwatch-multi-rule",
    })
    .promise();
  const promises = Rules.flatMap(
    ({ Name }) =>
      Name ? [
        cloudwatch
          .deleteRule({
            Name,
          })
          .promise(),
        cloudwatch
          .removeTargets({
            Ids: [Name],
            Rule: Name,
          })
          .promise(),
      ]:[]
  ).filter(Boolean);

  const result = await Promise.all(promises);
  console.log(JSON.stringify(result));
};

export const handler = async (eventsPerMinute?: number) => {
  await deleteCurrent();

  if (typeof eventsPerMinute === "number" && eventsPerMinute > 0) {
    for (let i = 0; i < eventsPerMinute; i++) {
      const { RuleArn } = await cloudwatch
        .putRule({
          Name: `cloudwatch-multi-rule-${i}`,
          ScheduleExpression: `rate(1 minute)`,
        })
        .promise();
      if (RuleArn) {
        await cloudwatch
          .putTargets({
            Rule: RuleArn,
            Targets: [
              {
                Arn: process.env.TimestampLambdaFunctionArn!,
                Id: `cloudwatch-multi-rule-${i}`,
              },
            ],
          })
          .promise()
          .then(console.log);
      }

      await new Promise((res) => setTimeout(res, 60000 / eventsPerMinute));
    }
  }
};

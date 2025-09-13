import { JsonSchema, JsonSchemaType } from "aws-cdk-lib/aws-apigateway";

// Flattened + typed schema for your "checkout" model
export const verificationSchemaForAPIGW: JsonSchema = {
  type: JsonSchemaType.OBJECT,
  required: ["id"],
  additionalProperties: true,
  properties: {
    id: {
      type: JsonSchemaType.STRING,
      minLength: 1,
    },
  },
};

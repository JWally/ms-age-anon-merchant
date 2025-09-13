export const checkoutSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      required: ["session-id"],
      additionalProperties: false,
      properties: {
        "session-id": {
          type: "string",
          minLength: 1,
          maxLength: 256,
        },
      },
    },
  },
  required: ["body"],
};

export const trackerSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      required: ["sessionId"],
      additionalProperties: true,
      properties: {
        sessionId: {
          type: "string",
          minLength: 1,
          maxLength: 256,
        },
      },
    },
  },
  required: ["body"],
};

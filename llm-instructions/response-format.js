const responseFormat = {
  type: "json_schema",
  json_schema: {
    name: "customer_interaction",
    schema: {
      type: "object",
      properties: {
        speak_to_customer: { type: "string" },
        customer_data: {
          type: "object",
          properties: {
            firstName: {
              type: "object",
              properties: {
                value: { type: ["string", "null"] },
                correct_spelling: { type: ["string", "null"] },
                spelling_confirmed: { type: ["boolean"] },
              }
            },
            lastName: {
              type: "object",
              properties: {
                value: { type: ["string", "null"] },
                correct_spelling: { type: ["string", "null"] },
                spelling_confirmed: { type: ["boolean"] }
              }
            }
          },
          required: ["firstName", "lastName"]
        }
      },
      required: ["speak_to_customer", "customer_data"]
    }
  }
};

export default responseFormat;
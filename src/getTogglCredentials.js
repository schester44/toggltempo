const prompt = require("prompt");

const schema = {
  properties: {
    email: {
      description: "Enter your toggl email address",
      type: "string",
      required: true
    },
    password: {
      description: "Enter your toggl password",
      type: "string",
      replace: "*",
      hidden: true,
      required: true
    },
    workerId: {
      description: "Enter your Tempo Worker ID",
      type: "string",
      required: true
    }
  }
};

module.exports = () => {
  prompt.start();

  return new Promise(resolve => {
    prompt.get(schema, (err, result) => resolve(result));
  });
};

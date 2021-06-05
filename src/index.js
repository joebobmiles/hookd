const express = require("express");
const fs = require("fs").promises;

const hookd = express();

hookd.get(
  "/up",
  (_, response) => response.sendStatus(200)
);

hookd.post(
  "/docker",
  (request, response) =>
  {
    console.log(request);
    response.send();
  }
);

const PORT = process.env.HOOKD_PORT || 8080;
hookd.listen(
  PORT,
  () =>
  {
    console.log(`Running on port ${PORT}.`);
  }
);
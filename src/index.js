const express = require("express");
const fs = require("fs");

const hookd = express();

const scriptsDir = fs.opendirSync("/tmp/scripts");
console.log(scriptsDir);

const registerScripts = (dir, app) =>
{
  // TODO
};

hookd.get("/up", (_, response) => response.sendStatus(200));

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

process.on("exit", () => root.close());
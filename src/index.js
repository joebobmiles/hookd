const path = require("path");
const fs = require("fs");
const express = require("express");
const util = require("util")
const execFile = util.promisify(require("child_process").execFile);

const hookd = express();
hookd.use(express.json());
hookd.use(express.urlencoded({ extended: true }))

const scriptsDir = fs.opendirSync("/tmp/scripts");

const registerScripts = (dir, app, accumulatedPath = "/") =>
{
  let entry;
  while ((entry = dir.readSync()) !== null)
  {
    if (entry.isDirectory())
    {
      registerScripts(
        fs.opendirSync(
          path.join(
            scriptsDir.path,
            accumulatedPath,
            entry.name
          )
        ),
        app,
        path.join(accumulatedPath, entry.name)
      );
    }

    else if (entry.isFile())
    {
      const route = path.join(
          accumulatedPath,
          path.basename(
            entry.name,
            path.extname(entry.name)
          )
        );

      const scriptPath = path.join(
        scriptsDir.path,
        accumulatedPath,
        entry.name
      );

      console.log(route, scriptPath);

      const invokeScript = async (env) =>
        await execFile(scriptPath, [], { env })

      app.get(
        route,
        (request, response) =>
          invokeScript(request.query)
          .then(
            () => response.sendStatus(200)
          )
          .catch(
            ({ stderr }) =>
            {
              response.status(500);
              response.send(stderr);
            }
          )
      );

      app.post(
        route,
        async (request, response) =>
          invokeScript(request.body)
          .then(
            () => response.sendStatus(200)
          )
          .catch(
            ({ stderr }) => 
            {
              response.status(500);
              response.send(stderr);
            }
          )
      )
    }
  }
};

registerScripts(scriptsDir, hookd)
scriptsDir.close();

hookd.get("/up", (_, response) => response.sendStatus(200));

const PORT = process.env.HOOKD_PORT || 8080;
hookd.listen(
  PORT,
  () =>
  {
    console.log(`Running on port ${PORT}.`);
  }
);
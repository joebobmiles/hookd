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

      const invokeScript = async (env) =>
      {
        console.log(scriptPath, process.env, env);
        await execFile(
          scriptPath,
          [],
          {
            env: {
              ...process.env,
              ...Object.entries(env).reduce(
                (acc, [ prop, value ]) =>
                  Object.assign(
                    acc,
                    {
                      [prop]:
                        typeof value !== 'object'
                        ? value
                        : JSON.stringify(value)
                    }
                  ),
                {}
              )
            }
          }
        );
      }

      const getArgs = {
        get: (request) => request.query,
        post: (request) => request.body,
      };

      for (let verb of [ "get", "post" ])
      {
        app[verb](
          route,
          (request, response) =>
            invokeScript(getArgs[verb](request))
            .then(
              ({ stdout }) =>
              {
                response.status(200);
                response.send(stdout);
              }
            )
            .catch(
              (error) =>
              {
                response.status(500);
                response.send(error);
                console.log(error);
              }
            )
        );
      }
    }
  }

  dir.close();
};

registerScripts(scriptsDir, hookd)

hookd.get("/up", (_, response) => response.sendStatus(200));

const PORT = process.env.HOOKD_PORT || 8080;
hookd.listen(
  PORT,
  () =>
  {
    console.log(`Running on port ${PORT}.`);
  }
);
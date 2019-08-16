#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const program = require('commander');
const { prompt } = require('inquirer');
const clone = require('git-clone');
const util = require("util");

const cloneAsync = util.promisify(clone);

const copyCode = async (dir) => {
  console.log("Installing Velzy in", dir);
  const codePath = path.resolve(__dirname, "../");
  const installPath = path.resolve(dir, "velzy");

  fs.mkdirSync(installPath);
  await cloneAsync("https://github.com/velzyapp/api", installPath);

  //add a .env file
  fs.writeFileSync(path.resolve(installPath, ".env"), "DATABASE_URL=postgres://localhost/velzy");

  console.log("DONE!");

}

const installDB = (conn) => {
  exec(`psql -f ${dbFile}`, (err, stdout) => {
    if (err) {
      // node couldn't execute the command
      console.log("There's a problem: ", err);
      return;
    }

    // the *entire* stdout and stderr (buffered)
    console.log(stdout);
  });
}


program
  .version('0.0.1')
  .description('Velzy command line utility. Drop in... hang ten.');

program
  .command("db <conn>")
  .description("Installs the Velzy DB to the supplied connection string. This requires psql, the PostgreSQL binary. Should be in URL format: postgres://user:pw@host/database")
  .action(conn => {
    const { exec } = require('child_process');
    const dbFile = path.resolve(__dirname, "db.sql");
    prompt({
      type: "input",
      name: "confirm",
      default: "n",
      choices: "y/n",
      message: "This will overwrite the entire installation, you sure? (y/n)"
    }).then(answer => {
      if (answer.confirm === "y"){
        installDB(conn)
      }else{
        console.log("DB not installed");
      }

    })

  })

program
  .command("create <dir>")
  .alias("c")
  .alias("install")
  .description("Create a Velzy backend app in the specified directory (default is current dir)")
  .action(dir => {
    const installDir = path.resolve(process.cwd(), dir)
    //copy Velzy source
    copyCode(installDir).then(res => {
      console.log("--------------------------------------");
      console.log("");
      console.log("cd velzy");
      console.log("npm install");
      console.log("");
      console.log("--------------------------------------");
      console.log("There's also a .env file in the root with a DATABASE_URL defaulted to localhost/velzy postgres database. You'll need to update that OR create a local database called Velzy.");
      console.log("Have fun!");
      console.log("");
    }).catch(err => {
      console.error("There's already a velzy directory here. Won't overwrite.");
    });

  });

program.parse(process.argv);

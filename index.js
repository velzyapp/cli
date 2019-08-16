#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const program = require('commander');
const { prompt } = require('inquirer');

const copyCode = (dir) => {
  console.log("Installing Velzy in", dir);
  const codePath = path.resolve(__dirname, "../");
  const installPath = path.resolve(dir, "velzy");

  fs.mkdirSync(installPath);

  let dirsToCopy = fs.readdirSync(codePath);

  //we don't want everything so...
  dirsToCopy = dirsToCopy.filter(d => {
    return d !== "node_modules" &&
    d !== "cli" &&
    d !== ".nuxt"
  });



  for(d of dirsToCopy){
    const from = path.resolve(__dirname, "../", d);
    const to = path.resolve(installPath, d);
    fs.copySync(from,to);
    console.log(d);
  }

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
    copyCode(installDir);

    console.log("--------------------------------------");
    console.log("");
    console.log("cd velzy");
    console.log("npm install");
  });

program.parse(process.argv);

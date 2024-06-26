#!/usr/bin/env node

const commander = require("commander");
const chalk = require("chalk");
const { Configuration, OpenAIApi } = require("openai");
const { exec } = require("child_process");

const { animate, stopAnimate, getPrompt } = require("./utils/functions.js");
const { notifier } = require("./utils/updateNotifier.js");

notifier.notify();

const fs = require("fs");
const path = require('path');
const currentVersion = "0.11.2";

const successColor = "#15d6a0";
const updateColor = "#90ee90";
const responseColor = "#2685de";
const errorColor = "#d64d2b";
const versionColor = "#e8dd3f";

commander
  .option("-a, --ask [prompt]", `Ask a question to ChatGPT ${chalk.grey("(requires OpenAI API key)")}`)
  .option("-u, --update", "Update CliGPT to the latest version")
  .option("-v, --version", "Check version of CliGPT")
  .option("-k, --apikey [value]", `Set OpenAI API key ${chalk.grey("(overwrites existing API key file)")}`)
  .option("-h, --help", "Show help menu")
  .parse(process.argv);

let apiKey = require("./apiKey.json")?.apikey ?? process?.env?.OPENAI_API_KEY ?? "";

if (commander.opts().version) {
  console.log(`CliGPT v${chalk.hex(versionColor)(require("./package.json")?.version ?? currentVersion)}`);
  process.exit(0);
} else if (commander.opts().update) {
  const loading = animate("Updating CliGPT").then((loader) => loader);
  exec("npm install -g cligpt", async (error, stdout, stderr) => {
    apiKey = require("./apiKey.json")?.apikey ?? process?.env?.OPENAI_API_KEY ?? "";
    if (error) {
      await stopAnimate(loading);
      console.log(`${chalk.hex(errorColor)("Error:")} ${error.message}`);
      return;
    }
    if (stderr) {
      await stopAnimate(loading);
      console.log(`stderr: ${stderr}`);
      return;
    }
    if (stdout) {
      fs.writeFileSync(path.join(__dirname, "apiKey.json"), JSON.stringify({ apikey: apiKey }));
      await stopAnimate(loading);
      console.log(chalk.hex(updateColor)("CliGPT has been successfully updated to the latest version!"));
      process.exit(0);
    }
    process.exit(0)
  });
} else if (commander.opts().ask) {
  if (!apiKey) {
    console.log(chalk.hex(errorColor)("Please set your OpenAI API key first!"));
    process.exit(0);
  }

  const configuration = new Configuration({ apiKey });
  const openai = new OpenAIApi(configuration);

  (async () => {
    try {
      await openai.listModels();
    } catch (error) {
      console.log(chalk.hex(errorColor)("Error: Invalid OpenAI API key."));
      process.exit(0);
    }

    let prompt = commander.opts()?.ask === true ? false : commander.opts()?.ask;
    if (!prompt) { prompt = await getPrompt(); console.log(); }

    const modelOptions = {
      model: "gpt-3.5-turbo",
      prompt,
      temperature: 0.9,
      max_tokens: 2048,
    };
    const loading = await animate("Generating response");
    try {
      const completion = await openai.createCompletion(modelOptions).then(async (response) => {
        await stopAnimate(loading);
        return response;
      });
      console.log(chalk.hex(responseColor)(completion.data.choices[0].text));
      console.log()
      process.exit(0);
    } catch (error) {
      await stopAnimate(loading);
      if (error.response) {
        console.log(chalk.hex(errorColor)("Error response from OpenAI:"));
        if (error.response.status === 401) {
          console.log(chalk.hex(errorColor)("Invalid API key. Please check your API key and try again."));
        } else if (error.response.status === 402) {
          console.log(chalk.hex(errorColor)("API key is valid, but you have exceeded your monthly quota. Please upgrade your account to continue using the API."));
        } else if (error.response.status === 503) {
          console.log(chalk.hex(errorColor)("OpenAI is currently unavailable. Please try again later."));
        } else {
          console.log(error.response.data);
        }
      } else {
        console.log(error.message);
      }
      process.exit(0);
    }
  })();
} else if (commander.opts().apikey) {
  if (!commander.opts().apikey || commander.opts().apikey === true) {
    console.log("Please provide an API key.");
    process.exit(0);
  }
  const apikeyFilePath = path.join(__dirname, 'apiKey.json');
  fs.writeFileSync(
    apikeyFilePath,
    JSON.stringify({ apikey: commander.opts().apikey }, null, 2),
  );
  console.log(chalk.hex(successColor)("API key set successfully!"));
  process.exit(0);
} else {
  console.log();
  commander.outputHelp();
  console.log();
  process.exit(0);
}
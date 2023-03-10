#!/usr/bin/env node

const updateNotifier = require('update-notifier');
const commander = require("commander");
const chalk = require("chalk");
const { Configuration, OpenAIApi } = require("openai");
const { exec } = require("child_process");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const fs = require("fs");
const path = require('path');
const currentVersion = "0.9.1";

const pkg = require('./package.json');
updateNotifier({ pkg }).notify();

const updateColor = "#008000";
const errorColor = "#ff0000";
const versionColor = "#ffff00";
const successColor = "#008000";

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
  const loading = animate("Updating CliGPT");
  exec("npm install -g cligpt", (error, stdout, stderr) => {
    apiKey = require("./apiKey.json")?.apikey ?? process?.env?.OPENAI_API_KEY ?? "";
    if (error) {
      clearInterval(loading);
      console.log();
      console.log(`${chalk.hex(errorColor)("Error:")} ${error.message}`);
      return;
    }
    if (stderr) {
      clearInterval(loading);
      console.log();
      console.log(`\rstderr: ${stderr}`);
      return;
    }
    if (stdout) {
      fs.writeFileSync(path.join(__dirname, "apiKey.json"), JSON.stringify({ apikey: apiKey }));
      clearInterval(loading);
      console.log();
      process.stdout.write("\r" + `Successfully updated to the latest version!`);
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
    if (!prompt) prompt = await getPrompt();

    const modelOptions = {
      model: "text-davinci-003",
      prompt,
      temperature: 0.9,
      max_tokens: 2048,

    };

    try {
      const completion = await openai.createCompletion(modelOptions);
      console.log(chalk.blue(completion.data.choices[0].text));
      console.log()
      process.exit(0);
    } catch (error) {
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
  console.log("API key set successfully!");
  process.exit(0);
} else {
  console.log();
  commander.outputHelp();
  console.log();
  process.exit(0);
}

async function getPrompt() {
  return new Promise((resolve, reject) => {
    readline.question(chalk.hex("#0f0560")("Type your Prompt: "), async (userInput) => {
      readline.close();
      resolve(userInput);
    });
  });
}

function animate(text = "") {
  const frames = [`${text} ${chalk.hex(vibgyor())("⠋")}  `, `${text} ${chalk.hex(vibgyor())("⠙")}  `, `${text} ${chalk.hex(vibgyor())("⠹")}  `, `${text} ${chalk.hex(vibgyor())("⠸")}  `, `${text} ${chalk.hex(vibgyor())("⠼")}  `, `${text} ${chalk.hex(vibgyor())("⠴")}  `, `${text} ${chalk.hex(vibgyor())("⠦")}  `, `${text} ${chalk.hex(vibgyor())("⠧")}  `, `${text} ${chalk.hex(vibgyor())("⠇")}  `, `${text} ${chalk.hex(vibgyor())("⠏")}  `];
  let i = 0;
  return setInterval(() => {
    process.stdout.write("\r" + frames[i]);
    i = (i + 1) % frames.length;
  }, 75);
}

function vibgyor() {
  const colors = ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#9400d3"];
  return colors[Math.floor(Math.random() * colors.length)];
}

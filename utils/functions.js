const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});
const chalk = require("chalk");

async function getPrompt() {
    return new Promise((resolve, reject) => {
        readline.question(chalk.hex("#c821ed")("Type your Prompt: "), async (userInput) => {
            readline.close();
            resolve(userInput);
        });
    });
}

async function animate(text = "") {
    const frames = [`${text} ${chalk.hex(await vibgyor())("⠋")}  `, `${text} ${chalk.hex(await vibgyor())("⠙")}  `, `${text} ${chalk.hex(await vibgyor())("⠹")}  `, `${text} ${chalk.hex(await vibgyor())("⠸")}  `, `${text} ${chalk.hex(await vibgyor())("⠼")}  `, `${text} ${chalk.hex(await vibgyor())("⠴")}  `, `${text} ${chalk.hex(await vibgyor())("⠦")}  `, `${text} ${chalk.hex(await vibgyor())("⠧")}  `, `${text} ${chalk.hex(await vibgyor())("⠇")}  `, `${text} ${chalk.hex(await vibgyor())("⠏")}  `];
    let i = 0;
    return setInterval(() => {
        process.stdout.write("\r" + frames[i]);
        i = (i + 1) % frames.length;
    }, 75);
}

async function stopAnimate(loader) {
    clearInterval(loader);
    process.stdout.write("\r");
    process.stdout.write(" ".repeat(100));
    process.stdout.write("\r");
}

async function vibgyor() {
    const colors = ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#4B0082', '#EE82EE']
    return colors[Math.floor(Math.random() * colors.length)];
}

module.exports = { getPrompt, animate, stopAnimate }
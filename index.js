const fsp = require("fs/promises");
const readline = require("readline/promises");
const jsonc = require("jsonc");
const suchibot = require("suchibot");
const midi = require("./midi");

function prompt(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return rl.question(message).then((response) => {
    rl.close();
    return response;
  });
}

async function main() {
  const configFile = process.argv[2];
  if (!configFile) {
    await prompt(
      "You need to drag-and-drop a .json config file with your MIDI mappings onto the .exe.\nPress enter to exit."
    );
    process.exit(1);
  }

  console.log("Loading config file:", configFile);
  const configStr = await fsp.readFile(configFile, "utf-8");
  const config = jsonc.parse(configStr);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  midi.listDevices();
  const choice = await rl.question(
    "Please enter the number for the MIDI device you want to use:"
  );
  rl.close();

  const { sleepAfterMs, mappings } = config;
  midi.start(parseInt(choice.trim()), mappings, { sleepAfterMs });
  suchibot.startListening();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

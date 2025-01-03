const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const readline = require("readline/promises");
const jsonc = require("jsonc");
const suchibot = require("suchibot");
const Midi = require("./lib/midi");

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
  let configFile = process.argv[2];
  if (!configFile) {
    await prompt(
      `You need to drag-and-drop a .jsonc config file with your MIDI mappings onto ${
        process.platform === "win32"
          ? "midi2key-win.exe"
          : "the midi2key binary"
      }.\nPress enter to exit.`
    );
    process.exit(1);
  }

  if (!path.isAbsolute(configFile)) {
    const relativeToCwd = path.resolve(process.cwd(), configFile);
    if (fs.existsSync(relativeToCwd)) {
      configFile = relativeToCwd;
    } else {
      const relativeToProgram = path.resolve(process.execPath, configFile);
      if (fs.existsSync(relativeToProgram)) {
        configFile = relativeToProgram;
      }
    }
  }

  console.log("Loading config file:", configFile);
  const configStr = await fsp.readFile(configFile, "utf-8");
  const config = jsonc.parse(configStr);
  const { sleepAfterMs, mappings } = config;

  const mappingsCount = Object.values(mappings).filter(Boolean).length;
  console.log(`Loaded ${mappingsCount} mappings.`);
  if (sleepAfterMs != null) {
    console.log(`Loaded sleepAfterMs: ${sleepAfterMs}.`);
  }

  const count = Midi.listDevices();
  let deviceIndex = 0;
  if (count > 0) {
    const choice = await prompt(
      "Please enter the number for the MIDI input device you want to use:"
    );
    deviceIndex = parseInt(choice.trim());
  }

  Midi.start(deviceIndex, mappings, { sleepAfterMs });
  suchibot.startListening();
  console.log("Now listening for input. Press Ctrl+C at any time to exit.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

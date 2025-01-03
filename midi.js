const { Key, Keyboard, sleep } = require("suchibot");
const midi = require("midi");

let input = null;

/**
 * Lists the midi devices connected to the computer.
 *
 * This can be used to help you figure out which index to use as the
 * `selectedPort` in {@link start}.
 */
function listDevices() {
  if (input == null) {
    input = new midi.Input();
  }

  const count = input.getPortCount();
  for (let i = 0; i < count; i++) {
    console.log(i, input.getPortName(i));
  }
}
exports.listDevices = listDevices;

const Notes = {
  "C  1": 36,
  "C# 1": 37,
  "D  1": 38,
  "Eb 1": 39,
  "E  1": 40,
  "F  1": 41,
  "F# 1": 42,
  "G  1": 43,
  "Ab 1": 44,
  "A  1": 45,
  "Bb 1": 46,
  "B  1": 47,

  "C  2": 48,
  "C# 2": 49,
  "D  2": 50,
  "Eb 2": 51,
  "E  2": 52,
  "F  2": 53,
  "F# 2": 54,
  "G  2": 55,
  "Ab 2": 56,
  "A  2": 57,
  "Bb 2": 58,
  "B  2": 59,

  "C  3": 60,
  "C# 3": 61,
  "D  3": 62,
  "Eb 3": 63,
  "E  3": 64,
  "F  3": 65,
  "F# 3": 66,
  "G  3": 67,
  "Ab 3": 68,
  "A  3": 69,
  "Bb 3": 70,
  "B  3": 71,

  "C  4": 72,
  "C# 4": 73,
  "D  4": 74,
  "Eb 4": 75,
  "E  4": 76,
  "F  4": 77,
  "F# 4": 78,
  "G  4": 79,
  "Ab 4": 80,
  "A  4": 81,
  "Bb 4": 82,
  "B  4": 83,

  "C  5": 84,
  "C# 5": 85,
  "D  5": 86,
  "Eb 5": 87,
  "E  5": 88,
  "F  5": 89,
  "F# 5": 90,
  "G  5": 91,
  "Ab 5": 92,
  "A  5": 93,
  "Bb 5": 94,
  "B  5": 95,

  "C  6": 96,

  36: "C  1",
  37: "C# 1",
  38: "D  1",
  39: "Eb 1",
  40: "E  1",
  41: "F  1",
  42: "F# 1",
  43: "G  1",
  44: "Ab 1",
  45: "A  1",
  46: "Bb 1",
  47: "B  1",

  48: "C  2",
  49: "C# 2",
  50: "D  2",
  51: "Eb 2",
  52: "E  2",
  53: "F  2",
  54: "F# 2",
  55: "G  2",
  56: "Ab 2",
  57: "A  2",
  58: "Bb 2",
  59: "B  2",

  60: "C  3",
  61: "C# 3",
  62: "D  3",
  63: "Eb 3",
  64: "E  3",
  65: "F  3",
  66: "F# 3",
  67: "G  3",
  68: "Ab 3",
  69: "A  3",
  70: "Bb 3",
  71: "B  3",

  72: "C  4",
  73: "C# 4",
  74: "D  4",
  75: "Eb 4",
  76: "E  4",
  77: "F  4",
  78: "F# 4",
  79: "G  4",
  80: "Ab 4",
  81: "A  4",
  82: "Bb 4",
  83: "B  4",

  84: "C  5",
  85: "C# 5",
  86: "D  5",
  87: "Eb 5",
  88: "E  5",
  89: "F  5",
  90: "F# 5",
  91: "G  5",
  92: "Ab 5",
  93: "A  5",
  94: "Bb 5",
  95: "B  5",

  96: "C  6",
};
exports.Notes = Notes;

const MessageIDs = {
  KEY_ON: 144,
  KEY_OFF: 128,

  144: "KEY_ON",
  128: "KEY_OFF",
};
exports.MessageIDs = MessageIDs;

const handledIds = new Set(Object.values(MessageIDs));

/**
 * Start listening for midi events and press the corresponding computer keyboard
 * keys when they occur
 *
 * @param selectedPort The zero-based index of which MIDI input device to use. If you don't know what to use, try `0` or `1`.
 * @param mappings Mapping object whose keys are midi key names (eg. "F# 5") and whose values are one or more computer keyboard keys (eg Key.BACKSPACE)
 * @param options Additional options that control behavior
 */
function start(
  /**
   * The zero-based index of which MIDI input device to use.
   *
   * If you don't know what to use, try `0` or `1`.
   */
  selectedPort,
  /**
   * Mapping object whose keys are midi key names (eg. "F# 5") and whose values
   * are one or more computer keyboard keys (eg Key.BACKSPACE)
   *
   * For example:
   * ```ts
   * {
   *   "G  2": Key.EQUAL,
   *   "Ab 2": [Key.LEFT_SHIFT, Key.EQUAL],
   *   "A  2": Key.T,
   *   "Bb 2": Key.ESCAPE,
   *   "B  2": Key.M,
   * }
   * ```
   *
   * When there's more than one computer keyboard key, they'll be pressed
   * sequentially from left-to-right when the midi key is pressed, and released
   * sequentially from right-to-left when the midi key is released.
   */
  mappings,
  options
) {
  if (input == null) {
    input = new midi.Input();
  }

  const states = new Map();

  const getState = (key) => states.get(key) || 0;
  const setState = (key, val) => states.set(key, val);

  input.on("message", (deltaTime, message) => {
    try {
      if (!handledIds.has(message[0])) {
        console.log(`Unhandled: ${message.join(", ")}`);
      }

      const [id, keyNum, velocity] = message;
      const keyName = Notes[keyNum];

      process.stdout.write(
        `${String(MessageIDs[id] || "UNK").padEnd(8, " ")} ${keyName
          .replace(/\s+/g, "")
          .padEnd(3, " ")} -> `
      );

      const input = mappings[keyName];
      if (input == null) {
        process.stdout.write("\n");
        return;
      }

      const stateBefore = Boolean(getState(input));

      switch (id) {
        case MessageIDs.KEY_ON: {
          setState(input, getState(input) + 1);
          break;
        }
        case MessageIDs.KEY_OFF: {
          setState(input, getState(input) - 1);
          break;
        }
        default: {
          // unhandled event; shouldn't happen unless you added to MessageIDs
          // without adding to this switch
          process.stdout.write(`unhandled (${id})\n`);
          return;
        }
      }

      const stateAfter = Boolean(getState(input));

      if (stateBefore != stateAfter) {
        const method = stateAfter ? Keyboard.hold : Keyboard.release;

        const keysToPress = [].concat(input);
        if (method === Keyboard.release) {
          keysToPress.reverse();
        }
        console.log(method.name.padEnd(7, " "), keysToPress);

        for (const key of keysToPress) {
          method(key);
          if (options?.sleepAfterMs) {
            sleep.sync(options.sleepAfterMs);
          }
        }
      }
    } catch (err) {
      // ignore
    }
  });

  input.openPort(selectedPort);
}

exports.start = start;

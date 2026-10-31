// Prints the ADMIN_PASSWORD_HASH line for .env.local. Run: npm run admin:hash-password
// Typing is hidden in a terminal. Piped input works too: the first line is the password.
import { hashPassword } from "../lib/auth/password";

const MIN_LENGTH = 12;

function readHidden(): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    let value = "";
    process.stdout.write("Admin password (typing is hidden): ");
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    stdin.resume();

    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") {
          stdin.off("data", onData);
          stdin.setRawMode(false);
          stdin.pause();
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (char === "\u0003") {
          stdin.setRawMode(false);
          process.exit(130);
        }
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else value += char;
      }
    };
    stdin.on("data", onData);
  });
}

async function readPiped(): Promise<string> {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  return input.split(/\r?\n/)[0] ?? "";
}

async function main(): Promise<void> {
  const password = process.stdin.isTTY ? await readHidden() : await readPiped();
  if (password.length < MIN_LENGTH) {
    console.error(`Use at least ${MIN_LENGTH} characters.`);
    process.exit(1);
  }

  console.log(`ADMIN_PASSWORD_HASH=${await hashPassword(password)}`);
}

void main();

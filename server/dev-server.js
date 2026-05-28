import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(projectRoot, ".env") });

const backendPort = Number(process.env.BACKEND_PORT || process.env.NEWS_API_PORT || 3001);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const children = new Set();
let shuttingDown = false;

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });

    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });

    socket.once("error", () => resolve(false));
    socket.setTimeout(700, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function startScript(scriptName) {
  console.log(`Starting ${scriptName}...`);

  const child = spawn(npmCommand, ["run", scriptName], {
    cwd: projectRoot,
    env: process.env,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  children.add(child);
  child.once("exit", (code, signal) => {
    children.delete(child);

    if (!shuttingDown) {
      const exitCode = typeof code === "number" ? code : 1;
      console.log(
        `${scriptName} stopped${signal ? ` (${signal})` : ""}. Shutting down dev tools.`
      );
      shutdown(exitCode);
    }
  });

  return child;
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    child.kill();
  }

  setTimeout(() => process.exit(exitCode), 200);
}

if (await isPortOpen(backendPort)) {
  console.log(`Talme backend already running on http://localhost:${backendPort}`);
} else {
  startScript("backend");
}

startScript("dev:client");

process.once("SIGINT", () => shutdown(0));
process.once("SIGTERM", () => shutdown(0));

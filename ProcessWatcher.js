const { spawn } = require("child_process");

class ProcessWatcher {
  constructor(relay, processPath, processId) {
    this.processPath = processPath;
    this.process = null;
    this.processId = processId;
    this.relay = relay;
  }

  startProcess() {
    this.process = spawn(this.processPath, [], {
        stdio: "inherit",
        windowsHide: true,
        detached: false,
    });

    return new Promise((resolve) => {
      this.process.on("exit", (code, signal) => {
        console.log(
          `Process exited with code ${code} and signal ${signal}. Restarting...`
        );
        this.relay.emit("PROCESS_CRASHED", {
          id: this.processId,
        });
        resolve(false);
        this.startProcess();
      });

      this.process.on("error", (error) => {
        console.error(`Process encountered an error: ${error}. Restarting...`);
        this.relay.emit("PROCESS_CRASHED", {
          id: this.processId,
        });
        resolve(false);
        this.startProcess();
      });
      this.process.on("spawn", () => {
        console.log(`Process spawned: ${this.processPath}`);
        resolve(true);
      });
    });
  }

  async start() {
    console.log(`Starting process: ${this.processPath}`);
    if (this.process) {
      this.stop();
    }
    return this.startProcess();
  }

  async stop() {
    if (this.process) {
      this.process.removeAllListeners();
      this.process.kill();
      this.process = null;
      console.log(`Stopped process: ${this.processPath}`);
    }
  }
}

module.exports = ProcessWatcher;

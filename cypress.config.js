import { defineConfig } from "cypress";
import { spawn } from "node:child_process";

const baseUrl = "http://127.0.0.1:3000";
let viteProcess;

const startVite = async () => {
  if (!viteProcess) {
    viteProcess = spawn(
      process.execPath,
      ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "3000", "--strictPort"],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          VITE_SUPABASE_URL: "http://127.0.0.1:3000",
          VITE_SUPABASE_ANON_KEY: "test-anon-key-not-a-secret",
        },
        stdio: "ignore",
      }
    );
  }

  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (viteProcess.exitCode !== null) {
      throw new Error(`Vite encerrou inesperadamente (código ${viteProcess.exitCode}).`);
    }

    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // O servidor ainda está inicializando.
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error("Vite não ficou disponível em http://127.0.0.1:3000.");
};

const stopVite = () => {
  if (viteProcess && viteProcess.exitCode === null) {
    viteProcess.kill("SIGTERM");
  }
  viteProcess = undefined;
};

export default defineConfig({
  e2e: {
    baseUrl,
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    setupNodeEvents(on) {
      on("after:run", stopVite);
      process.once("exit", stopVite);
      return startVite();
    },
  },
  video: false,
});

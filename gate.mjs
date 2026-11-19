// Checkout Gatekeeper — Node version of the ship gate (same rules as gate.sh).
// Runs Kane CLI on both flows, reads pass/fail, never fakes a result.
// Usage: node gate.mjs   (SHOP_URL env var optional, default http://localhost:8000)
import { spawnSync } from "node:child_process";

const shopUrl = process.env.SHOP_URL || "http://localhost:8000";
const flowFiles = ["kane/checkout_test.md", "kane/discount_test.md"];
// httpx (used by Kane's runner) cannot parse bracketed IPv6 entries such as
// *[::1] in no_proxy ("Invalid port: ':1]'"), so keep only plain localhost
// entries for the Kane run. The shop itself runs on localhost.
const env = {
  ...process.env,
  no_proxy: "localhost,127.0.0.1",
  NO_PROXY: "localhost,127.0.0.1",
  KANE_CLI_CHROME_PATH: process.env.KANE_CLI_CHROME_PATH || `${process.env.HOME}/.local/bin/chrome-nosandbox`,
};

let overall = 0;
for (const flowFile of flowFiles) {
  const result = spawnSync("kane-cli", ["testmd", "run", "--headless", "--url", shopUrl, flowFile], {
    encoding: "utf8",
    shell: false,
    env,
  });

  if (result.error && result.error.code === "ENOENT") {
    console.log("Kane not available: kane-cli is not installed or not on PATH.");
    console.log("Install it first: npm install -g @testmuai/kane-cli");
    process.exit(2);
  }
  if (result.error) {
    console.log(`BLOCKED — could not run kane-cli: ${result.error.message}`);
    process.exit(2);
  }

  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  console.log(output);
  console.log(`(shop: ${shopUrl}, flow: ${flowFile}, kane-cli exit status: ${result.status})`);

  if (result.status === 0 && /PASSED/i.test(output)) {
    console.log(`PASSED — Kane signed off on ${flowFile}. SHIP.`);
    continue;
  }
  overall = 1;
  if (/FAILED|FAIL/i.test(output) || result.status !== 0) {
    console.log(`BLOCKED — Kane failed the flow in ${flowFile}. Do not ship. Fix, then re-run the gate.`);
  } else {
    console.log(`BLOCKED — Kane result could not be determined from its output for ${flowFile}. Do not ship.`);
  }
}

if (overall === 0) {
  console.log("PASSED — Kane signed off on all flows. SHIP.");
  process.exit(0);
}
process.exit(1);

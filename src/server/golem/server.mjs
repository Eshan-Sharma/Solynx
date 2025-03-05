/**
 * This example demonstrates how easily lease multiple machines at once.
 */

import { GolemNetwork } from "@golem-sdk/golem-js";
import { pinoPrettyLogger } from "@golem-sdk/pino-logger";

const order = {
  demand: {
    workload: { imageTag: "golem/alpine:latest" },
  },
  market: {
    rentHours: 0.5,
    pricing: {
      model: "linear",
      maxStartPrice: 0.5,
      maxCpuPerHourPrice: 1.0,
      maxEnvPerHourPrice: 0.5,
    },
  },
};

(async () => {
  const glm = new GolemNetwork({
    logger: pinoPrettyLogger({
      level: "info",
    }),
    api: { key: "8df837f55dbc40ed89d74d8ed9aa993c" },
  });

  try {
    await glm.connect();
    const pool = await glm.manyOf({
      // I want to have a minimum of one machine in the pool,
      // but only a maximum of 3 machines can work at the same time
      poolSize: { min: 1, max: 3 },
      order,
    });

    // Process the @helloo folder
    const results = await Promise.allSettled([
      pool.withRental(async (rental) => {
        const exe = await rental.getExeUnit();
        
        // Create working directory
        await exe.run('mkdir -p /workdir/helloo');
        
        // Copy files from output/helloo to the worker
        // Note: You'll need to implement the actual file transfer mechanism
        await exe.run(`
          cd /workdir/helloo && \
          # Copy website files
          echo "Processing website files..." && \
          cp -r /* . && \
          
          # Install dependencies if needed
          if [ -f "package.json" ]; then
            npm install
          fi && \
          
          # Run any necessary build steps
          if [ -f "app.js" ]; then
            echo "Found app.js, processing..." && \
            node app.js
          fi
        `);
        
        return exe.run('ls -la /workdir/helloo');
      })
    ]);

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        console.log("Success:", result.value.stdout);
      } else {
        console.log("Failure:", result.reason);
      }
    });

  } catch (err) {
    console.error("Failed to run the example", err);
  } finally {
    await glm.disconnect();
  }
})().catch(console.error);

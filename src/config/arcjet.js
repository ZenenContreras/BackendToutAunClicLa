import arcjet, {shield, detectBot, tokenBucket} from "@arcjet/node";
import { ARCJET_KEY } from "./env.js";

const aj = arcjet({
    // Get your site key from https://app.arcjet.com and set it as an environment
    // variable rather than hard coding.
    key: ARCJET_KEY,
    characteristics: ["ip.src"], // Track requests by IP
    rules: [
      // Shield protects your app from common attacks e.g. SQL injection
      shield({ mode: process.env.NODE_ENV === 'production' ? "LIVE" : "DRY_RUN" }),
      // Create a bot detection rule
      detectBot({
        mode: process.env.NODE_ENV === 'production' ? "LIVE" : "DRY_RUN", // Use DRY_RUN for development/testing
        // Block all bots except the following
        allow: [
          "CATEGORY:SEARCH_ENGINE", 
        ],
      }),
      // Create a token bucket rate limit. Other algorithms are supported.
      tokenBucket({
        mode: process.env.NODE_ENV === 'production' ? "LIVE" : "DRY_RUN",
        refillRate: 5, // Refill 5 tokens per interval
        interval: 10, // Refill every 10 seconds
        capacity: 10, // Bucket capacity of 10 tokens
      }),
    ],
  });

export default aj
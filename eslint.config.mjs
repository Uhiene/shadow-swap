// eslint.config.mjs
import { defineConfig } from "eslint/config";

export default defineConfig({
  root: true,
  ignorePatterns: ["node_modules/", ".next/"],

  extends: [
    "next/core-web-vitals", // <-- use string path, NOT imported object
    "next/typescript",      // <-- use string path
  ],

  rules: {
    // your custom rules here
  },
});
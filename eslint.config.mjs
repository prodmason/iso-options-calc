import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.tsx", "**/*.jsx"], // Target JSX/TSX files
    rules: {
      "react/no-unescaped-entities": "off", // Disable the rule globally for JSX
    },
  },
];

export default eslintConfig;

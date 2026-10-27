import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "out/**", "build/**"]),
]);

eslintConfig.push({
  rules: {
    "react-hooks/set-state-in-effect": "warn",
    "no-unused-vars": "warn",
  },
});

export default eslintConfig;

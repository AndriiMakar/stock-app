/** @type {import('eslint').Linter.Config} */
const config = {
  files: ["**/*.ts"],
  ignores: ["node_modules/**"],
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parser: require("@typescript-eslint/parser"), // Correctly require the parser
  },
  plugins: {
    "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    prettier: require("eslint-plugin-prettier"),
  },
  rules: {
    "prettier/prettier": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    'import/no-extraneous-dependencies': 0,
    'import/no-absolute-path': 0,
    'import/no-named-as-default': 'warn',
    'import/no-cycle': 'warn',
    'import/prefer-default-export': 0,
    'import/named': 'error',
  },
};

module.exports = config;

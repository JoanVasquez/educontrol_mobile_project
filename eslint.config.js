const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  {
    ignores: ["projects/**/*"],
  },
  ...compat.config({
    overrides: [
      {
        files: ["*.ts"],
        parserOptions: {
          project: ["tsconfig.json"],
          createDefaultProgram: true,
        },
        plugins: ["@typescript-eslint"],
        extends: [
          "plugin:@typescript-eslint/recommended",
          "plugin:@angular-eslint/recommended",
          "plugin:@angular-eslint/template/process-inline-templates",
        ],
        rules: {
          "@typescript-eslint/consistent-type-imports": [
            "error",
            {
              prefer: "type-imports",
              fixStyle: "separate-type-imports",
            },
          ],
          "@typescript-eslint/no-explicit-any": "error",
          "@typescript-eslint/no-unused-vars": [
            "error",
            {
              argsIgnorePattern: "^_",
              varsIgnorePattern: "^_",
              caughtErrorsIgnorePattern: "^_",
            },
          ],
          eqeqeq: ["error", "always"],
          "no-console": ["warn", { allow: ["warn", "error"] }],
          "prefer-const": "error",
          "@angular-eslint/component-class-suffix": [
            "error",
            {
              suffixes: ["Page", "Component"],
            },
          ],
          "@angular-eslint/component-selector": [
            "error",
            {
              type: "element",
              prefix: "app",
              style: "kebab-case",
            },
          ],
          "@angular-eslint/directive-selector": [
            "error",
            {
              type: "attribute",
              prefix: "app",
              style: "camelCase",
            },
          ],
        },
      },
      {
        files: ["*.html"],
        extends: ["plugin:@angular-eslint/template/recommended"],
        rules: {
          "@angular-eslint/template/eqeqeq": "error",
        },
      },
    ],
  }),
];

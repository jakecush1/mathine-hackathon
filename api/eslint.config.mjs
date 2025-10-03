import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    // eslint.configs.recommended,
    // ...tseslint.configs.recommended,
    {
        plugins: {
            "@typescript-eslint": tseslint.plugin,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: true,
            },
        },
        extends: [...tseslint.configs.recommended],
        files: ["**/*.ts"],
        rules: {
            semi: [2, "always"],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/explicit-module-boundary-types": "warn",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-var-requires": "warn",
            "@typescript-eslint/no-unused-vars": ["error", { caughtErrors: "none" }],
        },
    }
);
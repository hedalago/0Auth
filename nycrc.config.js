module.exports = {
    "require": ["@ts-tools/node/r", "tsconfig-paths/register"],
    "include": [
        "packages/*/src/**/*.ts"
    ],
    "extension": [
        ".ts"
    ],
    "exclude": [
        "**/*.d.ts"
    ],
    "reporter": [
        "text-summary",
        "html"
    ],
    "all": true
}

// shared
// ======

declare module "*.peggy" {
    const parser: import("peggy").Parser;
    export = parser;
}
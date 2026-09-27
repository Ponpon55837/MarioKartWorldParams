/**
 * Node ESM 解析 hook：讓測試可直接 import 使用 `@/` 路徑別名的 TypeScript 原始碼
 * （對應 tsconfig.json 的 paths 設定），無需額外安裝建置工具。
 */
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = fileURLToPath(new URL("../src/", import.meta.url));
const EXTENSIONS = [".ts", ".tsx", "/index.ts"];

const resolveFile = (base) => {
  for (const ext of EXTENSIONS) {
    if (existsSync(base + ext)) return pathToFileURL(base + ext).href;
  }
  return null;
};

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const url = resolveFile(SRC + specifier.slice(2));
    if (url) return nextResolve(url, context);
  }
  if (
    specifier.startsWith(".") &&
    !/\.[cm]?[jt]sx?$/.test(specifier) &&
    context.parentURL?.includes("/src/")
  ) {
    const url = resolveFile(
      fileURLToPath(new URL(specifier, context.parentURL)),
    );
    if (url) return nextResolve(url, context);
  }
  return nextResolve(specifier, context);
}

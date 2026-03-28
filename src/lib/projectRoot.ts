import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Next.js may run API routes with a cwd that is not the repo root; find `package.json` by walking up. */
export function findProjectRoot(): string {
  const tryFrom = (start: string): string | null => {
    let dir = path.resolve(start);
    for (let i = 0; i < 16; i++) {
      const pkgPath = path.join(dir, "package.json");
      if (fs.existsSync(pkgPath)) {
        try {
          const name = JSON.parse(fs.readFileSync(pkgPath, "utf8")).name;
          if (name === "fiks") return dir;
        } catch {
          /* ignore */
        }
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    return null;
  };

  const fromCwd = tryFrom(process.cwd());
  if (fromCwd) return fromCwd;

  if (typeof import.meta.url !== "undefined") {
    const fromThisFile = tryFrom(path.dirname(fileURLToPath(import.meta.url)));
    if (fromThisFile) return fromThisFile;
  }

  return process.cwd();
}

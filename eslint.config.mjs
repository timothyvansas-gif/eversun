import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The Cloudflare build artifacts. `next build` output is ignored above by
    // default, but the opennext/wrangler equivalents are not — and linting
    // bundled vendor code buried thousands of generated-code complaints under
    // which any real finding in `src` was invisible.
    ".open-next/**",
    ".wrangler/**",
  ]),
]);

export default eslintConfig;

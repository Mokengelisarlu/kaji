import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // La couche domaine ne doit dépendre ni du DOM, ni d'une base, ni d'un
    // framework : c'est ce qui la rend vérifiable (05-development-standards.md
    // §58.3.2). Si un test a besoin de `jsdom`, c'est qu'il ne teste pas le
    // domaine.
    environment: "node",
    include: ["src/**/*.test.ts"],
    reporters: "dot",
  },
});

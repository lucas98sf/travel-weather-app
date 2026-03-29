import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    environment: "jsdom",
  },
  plugins: [
    tailwindcss(),
    react(),
    babel({
      presets: [reactCompilerPreset()],
      plugins: [["babel-plugin-relay", { artifactDirectory: "./src/__generated__" }]],
    }),
  ],
});

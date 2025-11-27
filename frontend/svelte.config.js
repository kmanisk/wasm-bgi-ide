import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig} */
export default {
  // Use the built-in vite preprocessor so we don't need an extra dependency.
  // This covers most common preprocessing (postcss, typescript, scss, etc.)
  preprocess: vitePreprocess(),
}

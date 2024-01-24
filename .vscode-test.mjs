import {defineConfig} from '@vscode/test-cli';

export default defineConfig({
  files: 'out/test/**/*.test.js',
  version: 'insiders',
  mocha: {
    ui: 'tdd',
    timeout: 20000,
  },
});

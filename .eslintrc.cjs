module.exports = {
  root: true,
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@babel/eslint-parser",
    ecmaVersion: 'latest',
    sourceType: "module",
    // --- บรรทัดนี้คือบรรทัดที่เพิ่มเข้ามา ---
    requireConfigFile: false, // บอก ESLint ว่าไม่ต้องหาไฟล์ babel.config.js
  },
  env: {
    browser: true,
    "vue/setup-compiler-macros": true,
  },
  extends: [
    "plugin:vue/vue3-essential",
    "prettier",
  ],
  plugins: [
    "vue",
  ],
  overrides: [
    {
      files: ["**/*.cy.{js,jsx,ts,tsx}"],
      extends: ["plugin:cypress/recommended"],
    },
  ],
  globals: {
    ga: "readonly",
    cordova: "readonly",
    __statics: "readonly",
    __QUASAR_SSR__: "readonly",
    __QUASAR_SSR_SERVER__: "readonly",
    __QUASAR_SSR_CLIENT__: "readonly",
    __QUASAR_SSR_PWA__: "readonly",
    process: "readonly",
    Capacitor: "readonly",
    chrome: "readonly",
  },
  rules: {
    "prefer-promise-reject-errors": "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
  },
};

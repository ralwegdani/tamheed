// An error that carries a translation key instead of fixed English text.
// Pages show it with t(error.toText()), so the message appears in the chosen language.
export default class AppError extends Error {
  constructor(key, vars) {
    super(key);
    this.key = key;
    this.vars = vars;
  }

  toText() {
    return { key: this.key, vars: this.vars };
  }
}

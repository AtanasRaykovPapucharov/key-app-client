export default ({ app }) => {
  const defaults = {
    input: {
      dense: true,
      debounce: 250,
    },
    btn: {
      unelevated: true,
      color: 'secondary',
      rounded: true,
      size: 'md',
    },
    card: {
      flat: true,
      bordered: true,
    },
    table: {
      dense: true,
      flat: true,
      bordered: true,
      separator: 'cell',
    },
    dialog: {
      seamless: true,
      persistent: false,
    },
  }

  // Make globally available
  app.config.globalProperties.$defaults = defaults
}

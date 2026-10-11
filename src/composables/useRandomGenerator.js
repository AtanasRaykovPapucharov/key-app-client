export default {
  newInt: (len = 10) => Math.floor(Math.random() * Math.pow(10, len)),
  newIntToString: (len = 10) => Math.floor(Math.random() * Math.pow(10, len)).toString(),
  newString: (len = 10) =>
    Math.random()
      .toString(36)
      .substring(3, len + 3),
}

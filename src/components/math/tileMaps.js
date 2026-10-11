const modules = import.meta.glob('./svg/*/{bg,en}/tiles.json', { eager: true, import: 'default' })

export default Object.fromEntries(
  Object.entries(modules).map(([path, tiles]) => {
    const [, folder, language] = path.match(/^\.\/svg\/([^/]+)\/(bg|en)\/tiles\.json$/)
    return [`${folder.replace(/-/g, '_')}:${language}`, tiles]
  }),
)

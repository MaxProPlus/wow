const {removeModuleScopePlugin, override, babelInclude} = require("customize-cra")
const path = require("path")

module.exports = override(
    // Импорт за пределы проекта
    removeModuleScopePlugin(),
    // Импорт типов и валидации с серверной части
    babelInclude([path.resolve("src"), path.resolve("../server/src/common")])
)
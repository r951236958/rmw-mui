/**  EXPORT ALL FUNCTIONS
 *
 *   Loads all files that have a specific extension
 *   Default extension is .f.js
 *   Exports a cloud function matching the file name
 *
 *   Based on this thread:
 *     https://github.com/firebase/functions-samples/issues/170
 */
require = require('esm')(module /*, options*/)
import { resolve } from 'path'
import glob from 'glob'
import camelCase from 'camelcase'

export default (folder, exports, extension = '.f.js') => {
  const files = glob.sync(`./**/*${extension}`, {
    cwd: resolve(folder),
    ignore: './node_modules/**',
  })

  for (let f = 0, fl = files.length; f < fl; f++) {
    const file = files[f]
    const functionName = camelCase(
      file
        .split(extension)
        .join('')
        .split('/')
        .join('_')
    ) // Strip off '.f.js'

    const mod = require(resolve(folder, file))
    exports[functionName] = mod.default || mod
  }
}

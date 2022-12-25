const Qiniu = require('qiniu')
const Path = require('path')
const Glob = require('glob')

module.exports = function Upload(
  token,
  sourceDir,
  destDir,
  progress,
  completion
) {
  var config = new Qiniu.conf.Config()
  const uploader = new Qiniu.form_up.FormUploader(config)

  const baseDir = Path.resolve(process.cwd(), sourceDir)
  const files = Glob.sync(`${baseDir}/**/*`, { nodir: true })
  const total = files.length

  const tasks = files.map((file, idx) => {
    const relativePath = Path.relative(baseDir, Path.dirname(file))
    const key = Path.join(destDir, relativePath, Path.basename(file))
    const extra = new Qiniu.form_up.PutExtra()
    return new Promise((resolve, reject) => {
      uploader.putFile(
        token,
        key,
        file,
        extra,
        function (respErr, respBody, respInfo) {
          if (respErr) {
            return reject(respErr)
          }
          if (respInfo.statusCode == 200) {
            progress({ file, key }, idx + 1, total)
            return resolve({ file, key })
          } else {
            return reject(
              new Error(
                `Upload failed: ${JSON.stringify(respBody)}, (Code:${
                  respInfo.statusCode
                })`
              )
            )
          }
        }
      )
    })
  })

  Promise.all(tasks).then(completion).catch(completion)
}

const Qiniu = require('qiniu')
const Path = require('path')
const Glob = require('glob')

function setupZone(zone) {
  switch (zone) {
    case 'z0':
      return Qiniu.zone.Zone_z0
    case 'z1':
      return Qiniu.zone.Zone_z1
    case 'z2':
      return Qiniu.zone.Zone_z2
    case 'na0':
      return Qiniu.zone.Zone_na0
    case 'as0':
      return Qiniu.zone.Zone_as0
  }
  return null
}

module.exports = function Upload(
  zone,
  token,
  sourceDir,
  destDir,
  progress,
  completion
) {
  var config = new Qiniu.conf.Config()
  config.zone = setupZone(zone) // 空间对应的机房
  // 是否使用https域名
  //config.useHttpsDomain = true;
  // 上传是否使用cdn加速
  //config.useCdnDomain = true;
  const uploader = new Qiniu.form_up.FormUploader(config)

  const baseDir = Path.resolve(process.cwd(), sourceDir)
  const files = Glob.sync(`${baseDir}/**/*`, { nodir: true })
  const total = files.length

  const tasks = files.map((file, idx) => {
    const relativePath = Path.relative(baseDir, Path.dirname(file))
    const key = Path.join(destDir, relativePath, Path.basename(file))
    const extra = new Qiniu.form_up.PutExtra()
    return () =>
      new Promise((resolve, reject) => {
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
              console.log(respBody)
              progress(key, idx, total)
              return resolve(respBody)
            } else {
              console.log(respInfo.statusCode)
              console.log(respBody)
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
  // return await Promise.all(tasks)
}

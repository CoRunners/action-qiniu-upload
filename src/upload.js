import Qiniu from 'qiniu'
import Path from 'path'
import Glob from 'glob'
import pRetry from 'p-retry'
// import pAll from 'p-all'

import pAll from 'p-all'

function getZone(z) {
  const map = {
    z0: Qiniu.zone.Zone_z0,
    z1: Qiniu.zone.Zone_z1,
    z2: Qiniu.zone.Zone_z2,
    na0: Qiniu.zone.Zone_na0,
    as0: Qiniu.zone.Zone_as0,
  }
  return map[z]
}

export function Upload(zone, token, sourceDir, destDir, progress, completion) {
  var config = new Qiniu.conf.Config()
  const z = getZone(zone)
  console.log(`z: ${JSON.stringify(z)}`)
  if (z != undefined) {
    config.zone = z // 空间对应的机房
  }
  console.log(`config z: ${JSON.stringify(config.zone)}`)
  // 是否使用https域名
  //config.useHttpsDomain = true;
  // 上传是否使用cdn加速
  //config.useCdnDomain = true;
  const uploader = new Qiniu.form_up.FormUploader(config)

  const baseDir = Path.resolve(process.cwd(), sourceDir)
  const files = Glob.sync(`${baseDir}/**/*`, { nodir: true })
  const total = files.length

  const tasks = files
    .map((file, idx) => {
      const relativePath = Path.relative(baseDir, Path.dirname(file))
      const key = Path.join(destDir, relativePath, Path.basename(file))
      const extra = new Qiniu.form_up.PutExtra()
      const task = () =>
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
                progress({ file, key }, idx + 1, total)
                return resolve({ file, key })
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
      return () => pRetry(task, { retries: 3 })
    })
    .filter((item) => !!item)

  pAll(tasks, { concurrency: 5 }).then(completion).catch(completion)
}

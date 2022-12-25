const Qiniu = require('qiniu')

module.exports = function Token(accessKey, secretKey, bucket, expires = 3600) {
  const mac = new Qiniu.auth.digest.Mac(accessKey, secretKey)
  const options = {
    scope: bucket,
    expires,
  }
  console.log(`qiniu options: ${JSON.stringify(options)}`)
  const putPolicy = new Qiniu.rs.PutPolicy(options)
  const token = putPolicy.uploadToken(mac)
  return token
}

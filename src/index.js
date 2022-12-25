const Core = require('@actions/core')
const Github = require('@actions/github')
const Token = require('./token')
const Upload = require('./upload')

async function run() {
  try {
    const accessKey = Core.getInput('access_key')
    const secretKey = Core.getInput('secret_key')
    const bucket = Core.getInput('bucket')
    const expires = parseInt(Core.getInput('expires')) || 3600
    const sourceDir = Core.getInput('source_dir')
    const destDir = Core.getInput('dest_dir')

    const token = Token(accessKey, secretKey, bucket, expires)
    Upload(
      token,
      sourceDir,
      destDir,
      ({ file, key }, idx, total) => {
        Core.info(`[${idx}/${total}]${file}: ${key} Uploaded`)
      },
      (error) => {
        if (error instanceof Error) {
          Core.setFailed(error.message)
        } else {
          Core.info('All Completed.')
        }
      }
    )

    const payload = JSON.stringify(Github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`)
  } catch (error) {
    Core.setFailed(error.message)
  }
}

run()

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
    const zone = Core.getInput('zone')
    const sourceDir = Core.getInput('source_dir')
    const destDir = Core.getInput('dest_dir')

    const token = Token(accessKey, secretKey, bucket, expires)
    Upload(
      zone,
      token,
      sourceDir,
      destDir,
      (key, idx, total) => {
        Core.info(`Uploaded[${idx}/${total}]: ${key}`)
      },
      (error) => {
        if (error instanceof Error) {
          Core.setFailed(error.message)
        } else {
          Core.info('All Completed.')
        }
      }
    )
    // const result = await Upload(
    //   zone,
    //   token,
    //   sourceDir,
    //   destDir,
    //   (key, idx, total) => {
    //     Core.info(`Uploaded[${idx}/${total}]: ${key}`)
    //   }
    // )
    // console.log(`result ${result}`)

    const payload = JSON.stringify(Github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`)
  } catch (error) {
    Core.setFailed(error.message)
  }
}

run()

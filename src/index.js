import Core from '@actions/core'
import Github from '@actions/github'
import { Token } from './token.js'
import { Upload } from './upload.js'

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
      (result) => {
        if (result instanceof Error) {
          Core.setFailed(result.message)
        } else {
          Core.info(result)
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

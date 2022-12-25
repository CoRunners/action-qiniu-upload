const process = require('process')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const path = require('path')

test('test runs', async () => {
  process.env['INPUT_ACCESS_KEY'] = ''
  process.env['INPUT_SECRET_KEY'] = ''
  process.env['INPUT_BUCKET'] = ''
  process.env['INPUT_ZONE'] = 'z0'
  process.env['INPUT_EXPIRES'] = 3000
  process.env['INPUT_SOURCE_DIR'] = './dist'
  process.env['INPUT_DEST_DIR'] = 'ipa'
  const ip = path.join(__dirname, 'index.js')
  const { stdout, stderr } = await exec(`node ${ip}`, { env: process.env })
  console.log(`stdout: ${stdout}`)
  console.log(`stderr: ${stderr}`)
})

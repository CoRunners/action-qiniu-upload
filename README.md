# Qiniu upload action

This action can upload some files to qiniu tos.

## Usage

```yaml
name: Upload Artifact

on:
  push:
    branches:
      - master

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@1.0
      - uses: CoRunners/action-qiniu-upload@master
        with:
          # Your qiniu access key, required.
          access_key: ${{ secrets.QINIU_ACCESS_KEY }}
          # Your qiniu secret key, required.
          secret_key: ${{ secrets.QINIU_SECRET_KEY }}
          # You will upload to bucket name, required.
          bucket: ${{ secrets.QINIU_BUCKET }}
          # Token expires, default 3600(s)
          expires: '3600'
          # You want to upload files directory, required.
          source_dir: './dist'
          # The directory of uploaded files, default: '', example: dist/
          dest_dir: 'dist'
```

# License

[Apache-2.0](LICENSE).

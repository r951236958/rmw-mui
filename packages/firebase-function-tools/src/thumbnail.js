const functions = require('firebase-functions')
const admin = require('firebase-admin')
const mkdirp = require('mkdirp-promise')
const spawn = require('child-process-promise').spawn
const path = require('path')
const os = require('os')
const fs = require('fs')

const THUMB_MAX_HEIGHT = 200
const THUMB_MAX_WIDTH = 200
const THUMB_PREFIX = 'thumb_'

module.exports = async (object, config = {}) => {
  const {
    maxHeight = THUMB_MAX_HEIGHT,
    maxWidth = THUMB_MAX_WIDTH,
    thumbPrefix = THUMB_PREFIX,
    cacheControl = 'public,max-age=216000',
  } = config

  const filePath = object.name
  const contentType = object.contentType // This is the image MIME type
  const fileDir = path.dirname(filePath)
  const fileName = path.basename(filePath)
  const thumbFilePath = path.normalize(
    path.join(fileDir, `${thumbPrefix}${fileName}`)
  )
  const tempLocalFile = path.join(os.tmpdir(), filePath)
  const tempLocalDir = path.dirname(tempLocalFile)
  const tempLocalThumbFile = path.join(os.tmpdir(), thumbFilePath)

  if (fileName.startsWith(thumbPrefix)) {
    console.log('Already a Thumbnail.')
    return false
  }

  const bucket = admin.storage().bucket(object.bucket)
  const file = bucket.file(filePath)
  const thumbFile = bucket.file(thumbFilePath)
  const metadata = {
    contentType: contentType,
    'Cache-Control': cacheControl,
  }

  await mkdirp(tempLocalDir)

  await file.download({
    destination: tempLocalFile,
  })

  await spawn(
    'convert',
    [
      tempLocalFile,
      '-thumbnail',
      `${maxWidth}x${maxHeight}>`,
      tempLocalThumbFile,
    ],
    { capture: ['stdout', 'stderr'] }
  )
  console.log('Thumbnail created at', tempLocalThumbFile)

  await bucket.upload(tempLocalThumbFile, {
    destination: thumbFilePath,
    predefinedAcl: 'publicRead',
    metadata: metadata,
  })
  console.log('Thumbnail uploaded to Storage at', thumbFilePath)

  fs.unlinkSync(tempLocalFile)
  fs.unlinkSync(tempLocalThumbFile)

  const downloadURL = `https://storage.googleapis.com/${object.bucket.replace(
    /\//g,
    '%2F'
  )}/${thumbFilePath}`

  return { file: thumbFile, downloadURL, fileDir, fileName }
}

const AWS = require("aws-sdk");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
var max_file_size = process.env.MAX_FILE_SIZE


const s3 = new AWS.S3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region,
});

/**
 * @description Uploads an image to S3
 * @param imageName Image name
 * @param base64Image Image body converted to base 64
 * @param type Image type
 * @return string S3 image URL or error accordingly
 */
//not used deprecated
async function upload(imageName, base64Image, type) {
  const params = {
    Bucket: `${BUCKET_NAME}/images`,
    Key: imageName.replace(" ", "-"),
    Body: new Buffer.from(
      base64Image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    ),
    ContentType: type,
  };

  let data;

  try {
    data = await promiseUpload(params);
  } catch (err) {
    console.error(err);
    return "";
  }
  return data;
}
//used to remove file
async function remove(fileKey) {
  const input = {
    Bucket: `${BUCKET_NAME}`, // required
    Key: fileKey, // required
  };
  try {
    let data = await removeFormS3Client(input);
    return data;
  } catch (err) {
    console.error(err);
    return "";
  }
}

//not used deprecated
function promiseUpload(params) {
  return new Promise(function (resolve, reject) {
    s3.upload(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

//deprecated
function promiseRemove(params) {
  return new Promise(function (resolve, reject) {
    s3.deleteObject(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// Initialize AWS S3

const s3Client = new S3Client({
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  region: region,
});
// Co
function removeFormS3Client(input) {
  return new Promise(function (resolve, reject) {
    const command = new DeleteObjectCommand(input);
    s3Client
      .send(command)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// nfigure multer-s3
const multerUpload = multer({
  limits: { fileSize: max_file_size },
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    // acl: 'public-read',  // or 'private'
    key: function (req, file, cb) {
      cb(
        null,
        (
          file.originalname.substring(0, file.originalname.lastIndexOf(".")) +
          "_" +
          Date.now().toString() +
          path.extname(file.originalname)
        ).replace(" ", "-")
      );
    },
  })
});

module.exports = { upload, remove, multerUpload };

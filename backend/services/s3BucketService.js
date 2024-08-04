const AWS = require('aws-sdk');

const BUCKET_NAME = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new AWS.S3({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region
});

/**
 * @description Uploads an image to S3
 * @param imageName Image name
 * @param base64Image Image body converted to base 64
 * @param type Image type
 * @return string S3 image URL or error accordingly
 */
async function upload(imageName, base64Image, type) {
    const params = {
        Bucket: `${BUCKET_NAME}/images`,
        Key: imageName.replace(" ", "-"),
        Body: new Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), 'base64'),
        ContentType: type
    };

    let data;

    try {
        data = await promiseUpload(params);
    } catch (err) {
        console.error(err);
        return "";
    }
    console.log("after upload data : ", data);

    return data;
}
async function remove(fileKey) {
    const params = {
        Bucket: `${BUCKET_NAME}/images`,
        Key: fileKey
    };
    let data;
    try {
        data = await promiseRemove(params);
        console.log("after remove file : ", data, " : ",params);
        return data;
    } catch (err) {
        console.error(err);
        return "";
    }
}
/**
 * @description Promise an upload to S3
 * @param params S3 bucket params
 * @return data/err S3 response object
 */
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
} function promiseRemove(params) {
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

module.exports = { upload, remove };
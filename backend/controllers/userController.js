const { CostExplorer } = require("aws-sdk");
const DataModel = require("../models/dataModel");
const s3BucketService = require("../services/s3BucketService");
const { response } = require("../src/app");

exports.getData = async function (req, res) {
    const { slug, flag, time } = req.body;

    let data_present;

    if (time) {
        data_present = await _getRequiredDataVersion(slug, time);
    } else if (flag == "allVersion") {
        console.log("all version")
        data_present = await DataModel.findOne({ unique_name: slug }, {
            'dataVersion.data': 0,
            'files': 0
        }
        );
    } else {
        data_present = await _getLatestDataVersion(slug);
    }

    if (data_present) {
        const requiredPayload = {
            _id: data_present._id,
            data: data_present.data,
            unique_name: data_present.unique_name,
            language: data_present.language,
            files: data_present.files,
        }

        if (flag != "allVersion" && data_present.latestDataVersion) {
            requiredPayload.data = data_present.latestDataVersion;
        }
        if (flag == "specific" && data_present.dataVersion) {
            requiredPayload.data = data_present.dataVersion;
        }

        if (flag == "allVersion") {
            requiredPayload.data = data_present.dataVersion;
        }
        console.log(flag, " : ", requiredPayload);
        res.status(200).json({
            success: true,
            message: "data found",
            result: requiredPayload,
        });
    } else {
        res.status(200).json({
            success: false,
            message: "data not found",
        });
    }
}


exports.saveData = async (req, res) => {
    try {
        const { slug, data } = req.body;

        const latestVersion = await _getLatestDataVersion(slug);
        if (latestVersion?.latestDataVersion?.data == data) {
            return res.status(201).json({
                success: true,
                message: "data save successfully",
            });
        }
        var newData = {
            time: new Date().getTime(),
            data: data
        };
        const data_present = await DataModel.updateOne({ unique_name: slug }, { $push: { "dataVersion": newData } }, { upsert: true });
        console.log("data find query : " + data_present.toString());
        if (data_present) {
            res.status(200).json({
                success: true,
                message: "data save successfully",
                newData: newData,
            });
        }
    } catch (e) {
        res.status(500).json({
            success: false,
            message: "internal server error : " + e,
        });
    }
}

exports.saveFile = async (req, res) => {

    const base64File = req.body.file;
    const unique_name = req.body.slug;
    const type = req.body.type;

    if (!unique_name) {
        return res.status(404).json({
            success: false,
            massege: "Slug is required"
        })
    }
    const fileName = unique_name + "-" + req.body.fileName;
    console.log(fileName, " , ", unique_name, " , ", type, " , " + typeof base64File);

    let response;
    try {
        response = await s3BucketService.upload(fileName, base64File, type);

        var fileObject = { name: fileName, url: response.Location, key: response.key, type: type };
        try {
            const data = await DataModel.updateOne({ unique_name: unique_name }, { $push: { "files": fileObject } }, { upsert: true });
        } catch (e) {
            return res.status(200).json({
                success: true,
                message: `Error uploading file: ${e}`
            });
        }

        res.status(200).json({
            success: true,
            message: "File successfully saved",
            result: fileObject,
        });

    } catch (err) {
        console.error(`Error uploading file: ${err.message}`);
        return res.status(200).json({
            success: true,
            message: `Error uploading file: ${fileName}`
        });
    }
}

exports.removeFile = async (req, res) => {

    const fileObject = req.body.file;
    var fileKey = fileObject.key;
    const unique_name = req.body.slug;
    if (!unique_name) {
        return res.status(404).json({
            success: false,
            massege: "Slug is required"
        })
    }

    console.log(unique_name, " , ", fileObject);
    let response;
    try {
        response = await s3BucketService.remove(fileKey);
    } catch (err) {
        console.error(`Error removing file : ${err.message}`);
        return res.status(200).json({
            success: true,
            message: `Error removing file in bucket : ${fileKey}`
        });
    }

    try {
        const data = await DataModel.updateOne({ unique_name: unique_name }, { $pull: { "files": { _id: fileObject._id } } });
    } catch (e) {
        return res.status(200).json({
            success: true,
            message: `Error uploading file: ${e}`
        });
    }

    res.status(200).json({
        success: true,
        message: "File removed successfully",
        file: fileObject
    });
}

async function _getLatestDataVersion(slug) {
    try {
        const result = await DataModel.aggregate([
            { $match: { unique_name: slug } },
            { $unwind: "$dataVersion" },
            { $sort: { "dataVersion.time": -1 } },
            {
                $group: {
                    _id: "$_id",
                    data: { $first: "$data" },
                    language: { $first: "$language" },
                    unique_name: { $first: "$unique_name" },
                    latestDataVersion: { $first: "$dataVersion" },
                    files: { $first: "$files" }
                }
            }
        ]);
        // console.log("document : ", result, " : ", slug);
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error('Error fetching the latest data version:', error);
        return null;
    }
}
async function _getRequiredDataVersion(slug, time) {
    try {
        const result = await DataModel.aggregate([
            {
                $match: {
                    unique_name: slug
                }
            },
            {
                $unwind: '$dataVersion'
            },
            {
                $match: {
                    'dataVersion.time': new Date(time)
                }
            },
        ]);

        console.log("document : ", result, " : ", slug, " : ", time);
        return (result && result.length > 0) ? result[0] : null;
    } catch (error) {
        console.error('Error fetching the latest data version:', error);
        return null;
    }
}
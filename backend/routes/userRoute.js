const express = require("express");
const DataModel = require("../models/dataModel");
const router = express.Router();

router.route("/saveData").post(saveData);
router.route("/getData/:slug").post(getData);


async function getData(req, res) {
  const { slug } = req.params;
  console.log(req.params);

  const data_present = await DataModel.findOne({ unique_name: slug });

  if (data_present) {
    res.status(200).json({
      success: true,
      message: "data found",
      data: data_present,
    });
  } else {
    res.status(200).json({
      success: false,
      message: "data not found",
    });
  }
}

async function saveData(req, res) {
  const { slug, data } = req.body;
  console.log("body : " + req.body);

  const data_present = await DataModel.findOne({ unique_name: slug });

  console.log("data find query : " + data_present);
  if (!data_present) {
    console.log("data insert present");
    const newData = new DataModel({
      unique_name: slug,
      data: data,
    });
    var tmp = await newData.save();
    res.status(200).json({
      success: true,
      message: "data save successfully",
      data: tmp,
    });
  } else {
    console.log("data update present");
    const result = await DataModel.updateOne(
      {
        _id: data_present._id,
      },
      { $set: { data: data } }
    );
    res.status(200).json({
      success: true,
      message: "data save successfully",
      result,
    });
  }
}

module.exports = router;

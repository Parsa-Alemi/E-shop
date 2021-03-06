const express = require("express");
const mongoose = require("mongoose");
const { Category } = require("../models/categories.js");
const { productsModel } = require("../models/product.js");
const sign = require("../auth/sign");
const auth = require("../auth/auth");
const multer = require("multer");
const e = require("express");

const FILE_NAME_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_NAME_TYPE[file.mimetype];
    let uploadError = new Error("Invalid Type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    console.log(fileName);
    const extension = FILE_NAME_TYPE[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});
let upload = multer({ storage: storage });
const router = express.Router();

async function showProducts(req, res) {
  const authResult = await auth(req, res, false);
  if (!authResult)
    return res.status(500).json({ success: false, err: "auth err" });
  const objtest = await productsModel.find().populate("category");
  if (!objtest) {
    res.status(500).json({ success: false });
  } else {
    res.send(objtest);
  }
}

async function addProducts(req, res) {
  const authResult = await auth(req, res, true);
  if (!authResult)
    return res.status(500).json({ success: false, err: "auth err" });
  const fileName = req.file.filename;
  let category = await Category.findById(req.body.category)
    .then(async (category) => {
      let newProduct = new productsModel();
      (newProduct.name = req.body.name),
        (newProduct.description = req.body.description),
        (newProduct.richDescription = req.body.richDescription),
        (newProduct.image = `${req.protocol}://${req.get(
          "host"
        )}/uploads/${fileName}`),
        (newProduct.brand = req.body.brand),
        (newProduct.category = req.body.category),
        (newProduct.rating = req.body.rating),
        (newProduct.numReviews = req.body.numReviews),
        (newProduct.isFeature = req.body.isFeature),
        (newProduct.price = req.body.price),
        (newProduct.count = req.body.count);
      await newProduct.save(function (err) {
        if (err) {
          res.status(500).json({ success: false });
        } else {
          res.send({ success: true });
        }
      });
    })
    .catch((err) => res.status(500).json({ success: false, err: err }));
}

//API routes
router.get("/", async (req, res) => showProducts(req, res));
router.post("/", upload.single("image"), async (req, res) =>
  addProducts(req, res)
);
router.get("/:id", async (req, res) => {
  const authResult = await auth(req, res, false);
  if (!authResult)
    return res.status(500).json({ success: false, err: "auth err" });
  const product = await productsModel
    .findById(req.params.id)
    .populate("category");
  if (!product) {
    res.status(500).json({
      success: false,
    });
  }
  res.status(200).send(product);
});

router.put("/:id", upload.single("image"), async (req, res) => {
  const authResult = await auth(req, res, true);
  if (!authResult)
    return res.status(500).json({ success: false, err: "auth err" });
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Id");
  }
  let category;
  Category.findById(req.body.category)
    .then((result) => {
      category = result;
    })
    .catch((err) => {
      return res.status(400).send("Invalid Category");
    });
  const product = await productsModel.findById(req.params.id);
  let filePath;
  if (!product) {
    return res.status(400).send("Invalid ID");
  }
  if (req.file) {
    const fileName = req.file.filename;
    filePath = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;
  } else {
    filePath = product.image;
  }

  productUpdate = await productsModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: filePath,
      brand: req.body.brand,
      category: req.body.category,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeature: req.body.isFeature,
      price: req.body.price,
      cout: req.body.cout,
    },
    { new: true }
  );
  if (!productUpdate) {
    return res.status(500).send("The Product not Created");
  }
  res.send(productUpdate);
});

router.delete("/:id", async (req, res) => {
  const authResult = await auth(req, res, true);
  if (!authResult)
    return res.status(500).json({ success: false, err: "auth err" });
  productsModel
    .findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res.status(200).json({
          success: true,
          message: "product is deleted",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "product not found",
        });
      }
    })
    .catch((err) => {
      return res.status(400).json({
        success: false,
        error: err,
      });
    });
});

module.exports = router;

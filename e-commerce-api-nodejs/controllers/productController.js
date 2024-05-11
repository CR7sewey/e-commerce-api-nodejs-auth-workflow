const BadRequest = require("../errors/bad-request");
const NotFound = require("../errors/not-found");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const path = require("path");

const getAllProducts = async (req, res) => {
  // TODO: PAGINATION AND FILTERING
  const products = await Product.find({}).populate("reviews");
  return res.status(StatusCodes.OK).json({ products, count: products.length });
};
const getSingleProduct = async (req, res) => {
  const { id } = req.params;
  /*if (!id) {
    throw new BadRequest("You need to provide an ID.");
  }*/
  const product = await Product.findOne({ _id: id });
  if (!product) {
    throw new NotFound("There is no product with this ID.");
  }
  return res.status(StatusCodes.OK).json({ product });
};
const createProduct = async (req, res) => {
  const { name, category, company, colors } = req.body;

  if (!name || !category || !company || !colors) {
    throw new BadRequest(
      "You need to provide all the required info about the product."
    );
  }

  let product = await Product.findOne({ ...req.body, user: req.user._id });
  if (product) {
    throw new BadRequest("This product already exists.");
  }
  product = await Product.create({ ...req.body, user: req.user._id });
  return res.status(StatusCodes.CREATED).json({ product });
};
const updateProduct = async (req, res) => {
  // check readme for notes!
  const { id } = req.params;
  if (!id) {
    throw new BadRequest("You need to provide an ID.");
  }
  const product = await Product.findByIdAndUpdate(
    { _id: id },
    { ...req.body },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!product) {
    throw new NotFound("There is no product with this ID.");
  }
  return res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new BadRequest("You need to provide an ID.");
  }
  const product = await Product.findOne({ _id: id });
  if (!product) {
    throw new NotFound("There is no product with this ID.");
  }
  await Product.deleteOne({ _id: id });
  return res.status(StatusCodes.OK).json({ msg: "Success. Product removed!" });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new BadRequest("You need to introduce a file!");
  }
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image")) {
    throw new BadRequest("You need to introduce a image!");
  }
  if (productImage.size > 1024 * 1024) {
    throw new BadRequest("You need to introduce a smaller image!");
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  return res
    .status(StatusCodes.OK)
    .json({ image: `/uploads/${productImage.name}` });
};

/*
const uploadProductImage = async (req, res) => {
  //console.log(req.files.image);
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: "file-upload",
    }
  );

  fs.unlinkSync(req.files.image.tempFilePath); // remove from tmp local folder

  return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
};

*/

module.exports = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};

import Product from "../models/product.model.js";

export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    res.json({
      products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /products/:id/reviews
export const addReview = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $push: { reviews: req.body } },
      { new: true, runValidators: true },
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PATCH /products/:id/stock  — body: { sku, delta }
export const updateStock = async (req, res) => {
  try {
    const { sku, delta } = req.body;
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, "variants.sku": sku },
      { $inc: { "variants.$.stock": delta } },
      { new: true, runValidators: true },
    );
    if (!product)
      return res.status(404).json({ message: "Product or SKU not found" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


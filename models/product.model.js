import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { _id: false, timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    variants: [variantSchema],
    reviews: [reviewSchema],
  },
  { collection: "products", timestamps: true },
);

// Virtual: average rating computed from embedded reviews
productSchema.virtual("avgRating").get(function () {
  if (!this.reviews.length) return null;
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  return parseFloat((sum / this.reviews.length).toFixed(2));
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

// Indexes
productSchema.index({ category: 1, name: 1 });
productSchema.index({ "variants.sku": 1 }, { unique: true, sparse: true });

const Product = mongoose.model("Product", productSchema);

export default Product;

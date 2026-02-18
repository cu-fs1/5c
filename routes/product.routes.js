import express from "express";
import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  addReview,
  updateStock,
  getStats,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/stats", getStats); // must be before /:id
router.get("/", getProducts);
router.post("/", createProduct);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/:id/reviews", addReview);
router.patch("/:id/stock", updateStock);

export default router;

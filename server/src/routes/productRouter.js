import express from 'express';
const router = express.Router();
import controller from'../controllers/productController.js';

router.get("/", controller.getAllProducts);
router.get("/:id", controller.getProductById);
router.post("/", controller.createProduct)
router.put("/:id", controller.updateProduct);
router.delete("/:id", controller.deleteProduct);        

export default router;

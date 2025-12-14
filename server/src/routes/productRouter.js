import express from 'express';
const router = express.Router();
import controller from'../controllers/productController.js';
import { authenticateToken, requiredAdmin } from '../middlewares/authMiddleware.js';

router.get("/", controller.getAllProducts);
router.get("/:id", controller.getProductById);
router.post("/", authenticateToken, controller.createProduct)
router.put("/:id", authenticateToken, controller.updateProduct);
router.delete("/:id",authenticateToken, requiredAdmin, controller.deleteProduct);        

export default router;

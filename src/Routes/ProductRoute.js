import express from "express";
import { AddProduct, GetActiveProducts, GetAllProduts, RemoveProduct, UpdateProduct } from "../Controllers/ProductController.js";

const productRouter = express.Router();

productRouter.get('/', GetAllProduts);
productRouter.get('/active', GetActiveProducts);
productRouter.post('/', AddProduct);
productRouter.put('/:id', UpdateProduct);
productRouter.delete('/:id', RemoveProduct);


export default productRouter;
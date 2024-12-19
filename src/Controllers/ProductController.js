import {PrismaClient} from "@prisma/client"
import { ProductSchema } from "../Schemas/ProductSchema.js";

const prisma = new PrismaClient();

export const GetAllProduts = async (req,res) =>{
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        res.status(500).json({"message": error});
    }
}

export const GetActiveProducts = async (req,res) =>{
    try {
        const products = await prisma.product.findMany({
            where: {
                isActive: true
            }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({"message": error});
    }
}

export const AddProduct = async (req,res) =>{
    try {
        const validateProduct = ProductSchema.parse(req.body);
        await prisma.product.create({data: validateProduct});
        res.send("Success");
    } catch (error) {
        res.status(500).json({
            "message": error
        })
    }
}

export const RemoveProduct = async (req,res) =>{
    try {
        const productId = Number(req.params.id);

        // Check if the product exists
        const pod = await prisma.product.findUnique({
            where: {
                productId : productId
            }
        })

        console.log(pod);

        if (!pod) {
            return res.status(404).json({
                message: 'Product not found',
            });
        }

        // Delete the product
        await prisma.product.delete({
            where: { productId: productId },
        });

        res.status(200).json({
            message: 'Product deleted successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "message": error
        })
    }
}

export const UpdateProduct = async(req,res)=>{
    try {
        const productId = Number(req.params.id);
        const { highestBid, productDescription, productName, startingBid, highestBidUserName, isActive } = req.body;

        const product = await prisma.product.findUnique({
            where: { productId: productId },
        });

        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
            });
        }

        // Update the product in the database
        const updatedProduct = await prisma.product.update({
            where: { productId: productId },
            data: {
                productName : productName || product.productName,
                productDescription: productDescription || product.productDescription,
                startingBid: startingBid || product.startingBid,
                highestBid: highestBid || product.highestBid,
                highestBidUserName: highestBidUserName || product.highestBidUserName,
                isActive: isActive || product.isActive
            },
        });

        // Respond with the updated product details
        res.status(200).json({
            message: 'Product updated successfully',
            updatedProduct,
        });
    } catch (error) {
        res.status(500).json({
            "message": error
        })
    }
}
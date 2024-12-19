import { z } from "zod";

export const ProductSchema = z.object({
    productName: z.string().min(3).max(15),
    startingBid: z.number()
})

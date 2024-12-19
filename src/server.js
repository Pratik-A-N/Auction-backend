import express from "express";
import cors from "cors";
import dontenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import productRouter from "./Routes/ProductRoute.js";
import {PrismaClient} from "@prisma/client"

dontenv.config();
const PORT = process.env.PORT;
const frontend_URL = process.env.FRONTEND_BASE_URL;

// define the cors configuration
const corsOptions = {
  origin: frontend_URL,
  credentials: true,
  optionSuccessStatus: 200,
};


// Initialize an HTTP server based on Express
const app = express()
const prisma = new PrismaClient();
const server = http.createServer(app);

// Modify the HTTP server
const io = new Server(server, {
  cors: {
    origin: frontend_URL,
    methods: ["GET", "POST"],
  },
});

app.use(cors(corsOptions));

app.use(express.json());
app.use('/product',productRouter)

io.on("connection", (socket)=>{
    console.log(`user connected to, Socket Id: ${socket.id}`)

    socket.on('bid',async ({productId, username, bid})=>{
      try {
        await prisma.$transaction(async (context) =>{
          const product = await context.product.findFirst({
            where: {
              productId: Number(productId)
            }
          })
  
          if (!product) {
              return socket.emit("bidError", "Product not found.");
          }
          const currentBid = product.highestBid || product.startingBid;
  
          if(currentBid >= bid){
            return socket.emit("bidError", "Your bid is lower than the current highest bid.");
          }
  
          if(currentBid + 5 < bid){
            return socket.emit("bidError", "Your bid cannot be more the +5 of the current price");
          }
  
          const updatedBid = await context.product.update({
              where: { productId },
              data: {
                  highestBid: bid,
                  highestBidUserName: username,
              },
          });
  
          io.emit("updateBid",{
            productId : productId,
            currentBid: updatedBid.highestBid,
            username: updatedBid.highestBidUserName
          })
        })
      } catch (error) {
        console.error("Error processing bid:", error);
        socket.emit("bidError", "An error occurred. Please try again.");
      }
    })

    socket.on('disconnect', () => console.log('disconnected'));
})

server.listen(PORT, () => {
  console.log(`Server is running at PORT: ${PORT}`);
});

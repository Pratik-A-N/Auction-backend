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

app.get('/',(req,res)=>{
  res.send("Hello World");
})

app.use('/product',productRouter)

io.on("connection", (socket)=>{
    const connectedUsers = io.engine.clientsCount;
    // console.log(connectedUsers);
    // console.log(`user connected to, Socket Id: ${socket.id}`)

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
            io.emit('logs',{
              status: "Rejected",
              username: username,
              bid: bid,
              currentBid: currentBid,
              timeStamp: new Date()
            })
            // console.log(`Rejected: ${username} | Bid: ${bid} | Timestamp: ${new Date()}`);
            return socket.emit("bidError", "Your bid is lower than the current highest bid.");
          }
  
          if(currentBid + 5 < bid){
            io.emit('logs',{
              status: "Rejected",
              username: username,
              bid: bid,
              currentBid: currentBid,
              timeStamp: new Date()
            })
            // console.log(`Rejected : ${username} | Bid: ${bid} | Timestamp: ${new Date()}`);
            return socket.emit("bidError", "Your bid cannot be more the +5 of the current price");
          }
  
          const updatedBid = await context.product.updateMany({
              where: { 
                productId,
                version: product.version
              },
              data: {
                  highestBid: bid,
                  highestBidUserName: username,
                  version: { increment: 1 },
              },
          });

          if (updatedBid.count === 0) {
            io.emit('logs',{
              status: "Rejected",
              username: username,
              bid: bid,
              currentBid: currentBid,
              timeStamp: new Date()
            })
            // console.log(`Rejected : ${username} | Bid: ${bid} | Timestamp: ${new Date()}`)
            return socket.emit("bidError", "The product has already been updated. Please try again.");
          }
  
          io.emit("updateBid",{
            productId : productId,
            currentBid: bid,
            username: username
          })

          io.emit('logs',{
            status: "Accepted",
            username: username,
            bid: bid,
            currentBid: bid,
            timeStamp: new Date()
          })
          console.log(`Accepted: ${username} - ${bid} | Timestamp: ${new Date()}`);
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

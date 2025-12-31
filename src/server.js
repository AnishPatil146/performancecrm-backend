import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import http from "http"
import { Server } from "socket.io"

import connectDB from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import companyRoutes from "./routes/companyRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import taskRoutes from "./routes/taskRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"
import performanceRoutes from "./routes/performanceRoutes.js"
import leadRoutes from "./routes/leadRoutes.js"

dotenv.config()
connectDB()

// 🔹 STEP 1: CREATE EXPRESS APP FIRST
const app = express()

app.use(cors())
app.use(express.json())

// 🔹 STEP 2: ROUTES
app.use("/api/auth", authRoutes)
app.use("/api/company", companyRoutes)
app.use("/api/users", userRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/performance", performanceRoutes)
app.use("/api/leads", leadRoutes)

// 🔹 STEP 3: BASIC TEST ROUTE
app.get("/", (req, res) => {
    res.send("PerformanceCRM Backend Running")
})

// 🔹 STEP 4: CREATE HTTP SERVER USING app
const server = http.createServer(app)

// 🔹 STEP 5: SOCKET.IO SETUP
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id)

    socket.on("joinCompany", (companyId) => {
        socket.join(companyId)
    })

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id)
    })
})

// 🔹 STEP 6: START SERVER
const PORT = process.env.PORT || 5001
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

// 🔹 STEP 7: EXPORT io FOR CONTROLLERS
export { io }

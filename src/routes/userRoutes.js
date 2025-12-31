import express from "express"
import { addUser } from "../controllers/userController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/add", protect, addUser)

export default router

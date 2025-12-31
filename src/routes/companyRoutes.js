import express from "express"
import { selectPlan } from "../controllers/companyController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/select-plan", protect, selectPlan)

export default router

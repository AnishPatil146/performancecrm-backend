import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import {
    getCeoDashboard,
    getLeadsAnalytics
} from "../controllers/dashboardController.js"

// ✅ ROUTER PEHLE INITIALIZE
const router = express.Router()

// CEO / Manager main dashboard
router.get("/ceo", protect, getCeoDashboard)

// Leads analytics dashboard
router.get("/leads-analytics", protect, getLeadsAnalytics)

export default router

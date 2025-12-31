import express from "express"
import { getMonthlyPerformance } from "../controllers/performanceController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

/**
 * @route   GET /api/performance/monthly
 * @desc    Get monthly performance of employees
 * @access  Private (CEO / Manager)
 * @query   month=1-12, year=YYYY
 */
router.get("/monthly", protect, getMonthlyPerformance)

export default router

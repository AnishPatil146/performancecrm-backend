import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import {
    getLeads,
    createLead,
    updateLead
} from "../controllers/leadController.js"

const router = express.Router()

router.get("/", protect, getLeads)
router.post("/", protect, createLead)
router.put("/:id", protect, updateLead)

export default router

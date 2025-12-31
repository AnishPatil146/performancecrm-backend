import express from "express"
import {
    createTask,
    completeTask,
    getMyTasks,
    getMyPendingTasks,
    getMyCompletedTasks
} from "../controllers/taskcontroller.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

// Manager / CEO → assign task to employee
router.post("/create", protect, createTask)

// Employee → complete task
router.put("/complete/:taskId", protect, completeTask)

// Employee → view own tasks
router.get("/my", protect, getMyTasks)
router.get("/my/pending", protect, getMyPendingTasks)
router.get("/my/completed", protect, getMyCompletedTasks)

export default router

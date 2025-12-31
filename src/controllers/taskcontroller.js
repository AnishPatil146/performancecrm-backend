import Task from "../models/Task.js"
import User from "../models/User.js"
import { io } from "../server.js"

/**
 * @desc    Create task (CEO / Manager)
 * @route   POST /api/tasks/create
 * @access  Private
 */
export const createTask = async (req, res) => {
    try {
        const { title, assignedTo } = req.body
        const { userId, companyId, role } = req.user

        // Permission check
        if (!["CEO", "Manager"].includes(role)) {
            return res.status(403).json({ message: "Access denied" })
        }

        // Validate employee
        const employee = await User.findOne({
            _id: assignedTo,
            companyId,
            role: "Employee"
        })

        if (!employee) {
            return res.status(400).json({ message: "Invalid employee" })
        }

        // Create task
        const task = await Task.create({
            companyId,
            assignedTo,
            assignedBy: userId,
            title
        })

        // 🔥 REAL-TIME EVENT
        io.to(companyId.toString()).emit("taskUpdated", {
            type: "CREATED",
            taskId: task._id
        })

        res.status(201).json({
            message: "Task assigned successfully",
            task
        })
    } catch (error) {
        console.error("Create Task Error:", error)
        res.status(500).json({ message: "Server error while creating task" })
    }
}

/**
 * @desc    Complete task (Employee)
 * @route   PUT /api/tasks/complete/:taskId
 * @access  Private
 */
export const completeTask = async (req, res) => {
    try {
        const { taskId } = req.params
        const { userId, companyId, role } = req.user

        if (role !== "Employee") {
            return res
                .status(403)
                .json({ message: "Only employees can complete tasks" })
        }

        const task = await Task.findOne({
            _id: taskId,
            companyId,
            assignedTo: userId
        })

        if (!task) {
            return res.status(404).json({ message: "Task not found" })
        }

        task.status = "Completed"
        task.completedAt = new Date()
        await task.save()

        // 🔥 REAL-TIME EVENT
        io.to(companyId.toString()).emit("taskUpdated", {
            type: "COMPLETED",
            taskId: task._id
        })

        res.json({ message: "Task completed successfully" })
    } catch (error) {
        console.error("Complete Task Error:", error)
        res.status(500).json({ message: "Server error while completing task" })
    }
}

/**
 * @desc    Get all tasks of logged-in employee
 * @route   GET /api/tasks/my
 * @access  Private (Employee)
 */
export const getMyTasks = async (req, res) => {
    try {
        const { userId, companyId, role } = req.user

        if (role !== "Employee") {
            return res.status(403).json({ message: "Access denied" })
        }

        const tasks = await Task.find({
            companyId,
            assignedTo: userId
        }).sort({ createdAt: -1 })

        res.json({ tasks })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

/**
 * @desc    Get pending tasks of employee
 * @route   GET /api/tasks/my/pending
 */
export const getMyPendingTasks = async (req, res) => {
    try {
        const { userId, companyId, role } = req.user

        if (role !== "Employee") {
            return res.status(403).json({ message: "Access denied" })
        }

        const tasks = await Task.find({
            companyId,
            assignedTo: userId,
            status: "Pending"
        })

        res.json({ tasks })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

/**
 * @desc    Get completed tasks of employee
 * @route   GET /api/tasks/my/completed
 */
export const getMyCompletedTasks = async (req, res) => {
    try {
        const { userId, companyId, role } = req.user

        if (role !== "Employee") {
            return res.status(403).json({ message: "Access denied" })
        }

        const tasks = await Task.find({
            companyId,
            assignedTo: userId,
            status: "Completed"
        })

        res.json({ tasks })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

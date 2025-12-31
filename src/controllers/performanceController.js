import Task from "../models/Task.js"
import User from "../models/User.js"

/**
 * @desc    Get monthly performance of all employees (CEO / Manager)
 * @route   GET /api/performance/monthly
 * @access  Private
 * @query   month (1-12), year (YYYY)
 */
export const getMonthlyPerformance = async (req, res) => {
    try {
        const { companyId, role } = req.user

        // Only CEO or Manager can view performance
        if (!["CEO", "Manager"].includes(role)) {
            return res.status(403).json({ message: "Access denied" })
        }

        const month = parseInt(req.query.month)
        const year = parseInt(req.query.year)

        if (!month || !year) {
            return res.status(400).json({
                message: "Month and year are required"
            })
        }

        // Date range for selected month
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0, 23, 59, 59)

        // Get all employees of the company
        const employees = await User.find({
            companyId,
            role: "Employee"
        })

        const results = []

        for (const emp of employees) {
            // Total tasks assigned in that month
            const totalTasks = await Task.countDocuments({
                companyId,
                assignedTo: emp._id,
                createdAt: { $gte: startDate, $lte: endDate }
            })

            // Tasks completed in that month
            const completedTasks = await Task.countDocuments({
                companyId,
                assignedTo: emp._id,
                status: "Completed",
                completedAt: { $gte: startDate, $lte: endDate }
            })

            // Performance score
            const score =
                totalTasks === 0
                    ? 0
                    : Math.round((completedTasks / totalTasks) * 100)

            // Rating logic
            let rating = "⭐"
            if (score >= 90) rating = "⭐⭐⭐⭐⭐"
            else if (score >= 75) rating = "⭐⭐⭐⭐"
            else if (score >= 60) rating = "⭐⭐⭐"
            else if (score >= 40) rating = "⭐⭐"

            results.push({
                employeeId: emp._id,
                name: emp.name,
                totalTasks,
                completedTasks,
                score,
                rating
            })
        }

        res.status(200).json({
            month,
            year,
            results
        })
    } catch (error) {
        console.error("Performance Error:", error)
        res.status(500).json({
            message: "Server error while fetching performance"
        })
    }
}

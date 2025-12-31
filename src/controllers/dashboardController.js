import User from "../models/User.js"
import Task from "../models/Task.js"
import Company from "../models/company.js"
import Lead from "../models/Lead.js"

export const getLeadsAnalytics = async (req, res) => {
    try {
        const { companyId, role } = req.user

        if (!["CEO", "Manager"].includes(role)) {
            return res.status(403).json({ message: "Access denied" })
        }

        const totalLeads = await Lead.countDocuments({ companyId })
        const convertedLeads = await Lead.countDocuments({
            companyId,
            status: "Converted"
        })
        const lostLeads = await Lead.countDocuments({
            companyId,
            status: "Lost"
        })

        const statusStats = await Lead.aggregate([
            { $match: { companyId } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ])

        const conversionRate =
            totalLeads === 0
                ? 0
                : Math.round((convertedLeads / totalLeads) * 100)

        res.json({
            totalLeads,
            convertedLeads,
            lostLeads,
            conversionRate,
            statusStats
        })
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch lead analytics" })
    }
}

export const getCeoDashboard = async (req, res) => {
    try {
        const { companyId, role } = req.user

        if (role !== "CEO") {
            return res.status(403).json({ message: "Access denied" })
        }

        const company = await Company.findById(companyId)

        const totalEmployees = await User.countDocuments({
            companyId,
            role: "Employee"
        })

        const totalTasks = await Task.countDocuments({ companyId })
        const completedTasks = await Task.countDocuments({
            companyId,
            status: "Completed"
        })

        res.json({
            companyName: company.name,
            plan: company.plan,
            stats: {
                totalEmployees,
                totalTasks,
                completedTasks,
                pendingTasks: totalTasks - completedTasks
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

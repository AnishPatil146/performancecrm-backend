import Company from "../models/company.js"

/**
 * @desc    Select or change company plan
 * @route   POST /api/company/select-plan
 * @access  Private (CEO only)
 */
export const selectPlan = async (req, res) => {
    try {
        // body se plan aayega
        const { plan } = req.body

        // authMiddleware se aata hai (JWT ke through)
        const companyId = req.user.companyId

        // validate plan
        const allowedPlans = ["FREE", "PRO", "ENTERPRISE"]
        if (!allowedPlans.includes(plan)) {
            return res.status(400).json({
                message: "Invalid plan selected"
            })
        }

        // company find karo
        const company = await Company.findById(companyId)

        if (!company) {
            return res.status(404).json({
                message: "Company not found"
            })
        }

        // plan update
        company.plan = plan
        company.planActivatedAt = new Date()

        await company.save()

        // response
        res.status(200).json({
            message: "Plan selected successfully",
            company: {
                id: company._id,
                name: company.name,
                plan: company.plan,
                planActivatedAt: company.planActivatedAt
            }
        })
    } catch (error) {
        console.error("Select Plan Error:", error)
        res.status(500).json({
            message: "Server error while selecting plan"
        })
    }
}

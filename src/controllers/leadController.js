import Lead from "../models/Lead.js"
import { io } from "../server.js"

// GET ALL LEADS
export const getLeads = async (req, res) => {
    try {
        const { companyId } = req.user
        const leads = await Lead.find({ companyId }).sort({ createdAt: -1 })
        res.json({ leads })
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch leads" })
    }
}

// CREATE LEAD
export const createLead = async (req, res) => {
    try {
        const { name, email, status } = req.body
        const { companyId } = req.user

        const lead = await Lead.create({
            name,
            email,
            status,
            companyId
        })

        // 🔥 REAL-TIME EVENT
        io.to(companyId.toString()).emit("leadUpdated")

        res.status(201).json(lead)
    } catch (err) {
        res.status(500).json({ message: "Failed to create lead" })
    }
}

// UPDATE LEAD (WITH STATUS FLOW)
export const updateLead = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const lead = await Lead.findById(id)
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" })
        }

        const flow = {
            New: ["Contacted"],
            Contacted: ["Qualified", "Lost"],
            Qualified: ["Converted", "Lost"],
            Converted: [],
            Lost: []
        }

        if (status && !flow[lead.status].includes(status)) {
            return res.status(400).json({
                message: `Invalid status change from ${lead.status} to ${status}`
            })
        }

        Object.assign(lead, req.body)
        await lead.save()

        // 🔥 REAL-TIME EVENT
        io.to(lead.companyId.toString()).emit("leadUpdated")

        res.json(lead)
    } catch (err) {
        res.status(500).json({ message: "Failed to update lead" })
    }
}

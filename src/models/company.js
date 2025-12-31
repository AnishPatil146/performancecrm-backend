import mongoose from "mongoose"

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        plan: {
            type: String,
            enum: ["FREE", "PRO", "ENTERPRISE"],
            default: "FREE"
        },
        planActivatedAt: {
            type: Date
        }
    },
    { timestamps: true }
)

const Company = mongoose.model("Company", companySchema)

export default Company

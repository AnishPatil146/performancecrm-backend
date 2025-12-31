import mongoose from "mongoose"

const leadSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        status: {
            type: String,
            enum: ["New", "Contacted", "Qualified", "Converted", "Lost"],
            default: "New"
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true
        }
    },
    { timestamps: true }
)

export default mongoose.model("Lead", leadSchema)

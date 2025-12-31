import bcrypt from "bcryptjs"
import User from "../models/User.js"

export const addUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body
        const { companyId, role: creatorRole } = req.user

        // Role permission check
        if (creatorRole === "Employee") {
            return res.status(403).json({ message: "Access denied" })
        }

        if (creatorRole === "Manager" && role !== "Employee") {
            return res.status(403).json({ message: "Managers can add only Employees" })
        }

        // Check existing user
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({ message: "User already exists" })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            companyId,
            name,
            email,
            password: hashedPassword,
            role
        })

        res.status(201).json({
            message: "User added successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

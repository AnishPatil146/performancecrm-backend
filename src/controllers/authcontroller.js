import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import Company from "../models/company.js"
import User from "../models/User.js"

// 🔐 REGISTER (Company + CEO)
export const register = async (req, res) => {
    try {
        const { companyName, name, email, password } = req.body

        // Check if user exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }

        // Create company
        const company = await Company.create({ name: companyName })

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create CEO user
        const user = await User.create({
            companyId: company._id,
            name,
            email,
            password: hashedPassword,
            role: "CEO",
        })

        // Generate token
        const token = jwt.sign(
            {
                userId: user._id,
                companyId: company._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.status(201).json({
            message: "Company registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
            },
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// 🔑 LOGIN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const token = jwt.sign(
            {
                userId: user._id,
                companyId: user.companyId,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
            },
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

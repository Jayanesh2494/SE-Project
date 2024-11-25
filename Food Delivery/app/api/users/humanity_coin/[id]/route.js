import jwt from "jsonwebtoken"; 
import connectDB from "../../../../libs/mongodb";
import User from "../../../../models/userModel"; // Ensure this model is correctly defined
import { NextResponse } from "next/server";

// Replace with your actual secret key used for signing the JWT
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req) {
    try {
        // Get the Authorization header from the request
        const authHeader = req.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized: Missing token" }, { status: 401 });
        }

        // Extract the token
        const token = authHeader.split(" ")[1];

        // Verify the token and extract user information
        let userId;
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.userId;
        } catch (error) {
            return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 });
        }

        // Parse request body
        const body = await req.json();
        const { amount, operation, description } = body;

        // Ensure you have connected to the database
        await connectDB();

        // Find the user by ID in MongoDB
        const user = await User.findOne({ _id: userId });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, user }, { status: 200 });
    } catch (error) {
        console.error("Error finding user:", error);
        return NextResponse.json({ message: "Error finding user", error }, { status: 500 });
    }
}

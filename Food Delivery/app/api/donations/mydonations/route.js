import jwt from "jsonwebtoken"; // Import JWT library
import connectDB from "../../../../libs/mongodb";
import Donation from "../../../../models/donationModel"; // Ensure this model is correctly defined
import { NextResponse } from "next/server";

// Replace with your actual secret key used for signing the JWT
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

// The GET handler
export async function GET(req) {
  try {
    // Get the Authorization header from the request
    const authHeader = req.headers.get("Authorization");

    // Check if the Authorization header is present and properly formatted
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized: Missing or malformed token" },
        { status: 401 }
      );
    }

    // Extract the token from the header
    const token = authHeader.split(" ")[1];

    // Decode and verify the token
    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET); // Verify the token
      userId = decoded.userId; // Extract the userId from the decoded token payload
    } catch (error) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid or expired token" },
        { status: 401 }
      );
    }

    // Ensure database connection
    await connectDB();

    // Fetch donations associated with the authenticated user
    const donations = await Donation.find({ userId });

    // Return the donations if found
    return NextResponse.json({ success: true, donations }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving donations:", error);
    return NextResponse.json(
      { message: "Server Error: Unable to fetch donations", error: error.message },
      { status: 500 }
    );
  }
}

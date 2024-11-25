import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken"; // Import JWT library

// Replace with your actual secret key used for signing the JWT
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the Authorization header from the request
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token and extract user information
    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId; // Assuming the token payload includes the userId
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID found in token" });
    }

    // Proceed with your logic (e.g., retrieve data from your database)
    res.status(200).json({ success: true, userId });
  } catch (error) {
    console.error("Error in API handler:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

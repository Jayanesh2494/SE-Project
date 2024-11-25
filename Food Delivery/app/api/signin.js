

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    try {
      // Mock user authentication (Replace with database validation)
      if (email === "test@example.com" && password === "password123") {
        // Generate a mock JWT token
        const token = "mock-jwt-token"; // Replace with actual JWT generation logic

        return res.status(200).json({ message: "Sign-in successful", token });
      } else {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    // Handle unsupported HTTP methods
    return res.status(405).json({ message: "Method not allowed" });
  }
}

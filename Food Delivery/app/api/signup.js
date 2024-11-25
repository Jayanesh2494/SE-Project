export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    try {
      // Perform user signup logic (e.g., save user in database)
      // Mocking database save
      console.log("Saving user:", { email, password });

      // Respond with success
      return res.status(201).json({ message: "User signed up successfully" });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    // Handle unsupported HTTP methods
    return res.status(405).json({ message: "Method not allowed" });
  }
}

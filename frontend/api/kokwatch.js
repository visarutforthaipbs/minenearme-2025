// Vercel serverless function to proxy KokWatch API requests
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Get the token from query parameters
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Token is required",
      });
    }

    // Construct the external API URL
    const externalApiUrl = `https://api.redesign.csitereport.com/publicdata/get_kokwatch?token=${token}`;

    console.log("Fetching KokWatch data from:", externalApiUrl);

    // Make request to external API
    const response = await fetch(externalApiUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "MineNearMe/1.0",
      },
    });

    if (!response.ok) {
      console.error(
        "External API error:",
        response.status,
        response.statusText
      );
      return res.status(response.status).json({
        status: "error",
        message: `External API error: ${response.statusText}`,
      });
    }

    const data = await response.json();
    console.log(
      "KokWatch data fetched successfully, data points:",
      data?.data?.pcd_data?.length || 0,
      "PCD points and",
      data?.data?.maefahluang_data?.length || 0,
      "MaeFahLuang points"
    );

    // Return the data
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in KokWatch proxy:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

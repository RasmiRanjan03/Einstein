// backend/controller/ai.controller.js
export const getAQI = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    // For the hackathon, you can return mock data or connect to an API like OpenWeather
    // Example Mock Data:
    const mockData = {
      aqi: 54,
      status: "Moderate",
      description: "Air quality is acceptable.",
      coordinates: { lat: latitude, lng: longitude }
    };

    res.status(200).json({
      status: 'success',
      data: mockData
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch AQI data" });
  }
};

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    // Logic for Gemini/OpenAI integration would go here
    res.status(200).json({ 
      reply: `This is a placeholder AI response to: "${message}"` 
    });
  } catch (error) {
    res.status(500).json({ message: "AI Chat failed" });
  }
};
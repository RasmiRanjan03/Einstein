// hospital.controller.js
import axios from 'axios';

export const getAllRegionHospitals = async (req, res) => {
    try {
        const bbox = "20.0,85.4,20.4,85.9";
        const osmQuery = `
            [out:json];
            (
              node["amenity"="hospital"](${bbox});
              way["amenity"="hospital"](${bbox});
              relation["amenity"="hospital"](${bbox});
            );
            out center;
        `;

        const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(osmQuery)}`);
        const hospitals = formatOSMData(response.data.elements);
        res.status(200).json({ success: true, count: hospitals.length, data: hospitals });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch region hospitals" });
    }
};

export const getNearbyRadiusHospitals = async (req, res) => {
    try {
        const { lat, lon, radius = 10000 } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: "Lat and Lon required" });

        const osmQuery = `
            [out:json];
            (
              node["amenity"="hospital"](around:${radius}, ${lat}, ${lon});
              way["amenity"="hospital"](around:${radius}, ${lat}, ${lon});
              relation["amenity"="hospital"](around:${radius}, ${lat}, ${lon});
            );
            out center;
        `;

        const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(osmQuery)}`);
        const hospitals = formatOSMData(response.data.elements);
        res.status(200).json({ success: true, count: hospitals.length, data: hospitals });
    } catch (error) {
        res.status(500).json({ success: false, error: "Nearby search failed" });
    }
};

const formatOSMData = (elements) => {
    return elements.map(h => ({
        id: h.id,
        name: h.tags?.name || "Medical Center",
        address: h.tags?.["addr:full"] || h.tags?.["addr:street"] || "Location unavailable",
        phone: h.tags?.phone || h.tags?.["contact:phone"] || "N/A",
        lat: h.lat || h.center?.lat,
        lon: h.lon || h.center?.lon,
    }));
};
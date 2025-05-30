// Mock GeoJSON data for mines in Thailand

// Active Mines GeoJSON
export const activeMinesData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: 1,
        name: "เหมืองทองคำชาตรี",
        mineral: "gold",
        status: "active",
        year_opened: 2001,
        production: "5 tons/year",
        company: "อัครา รีซอร์สเซส",
        description: "เหมืองทองคำขนาดใหญ่ในจังหวัดพิจิตร",
      },
      geometry: {
        type: "Point",
        coordinates: [100.4978, 16.2794],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 2,
        name: "เหมืองถ่านหินแม่เมาะ",
        mineral: "coal",
        status: "active",
        year_opened: 1955,
        production: "16 million tons/year",
        company: "การไฟฟ้าฝ่ายผลิต",
        description: "เหมืองถ่านหินลิกไนต์ขนาดใหญ่ที่สุดในประเทศไทย",
      },
      geometry: {
        type: "Point",
        coordinates: [99.7283, 18.3435],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 3,
        name: "เหมืองแร่สังกะสีตาก",
        mineral: "zinc",
        status: "active",
        year_opened: 1984,
        production: "30,000 tons/year",
        company: "ผาแดง อินดัสทรี",
        description: "เหมืองสังกะสีใต้ดินขนาดใหญ่ในจังหวัดตาก",
      },
      geometry: {
        type: "Point",
        coordinates: [98.9164, 16.7812],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 4,
        name: "เหมืองหินปูนสระบุรี",
        mineral: "limestone",
        status: "active",
        year_opened: 1969,
        production: "5 million tons/year",
        company: "ปูนซิเมนต์ไทย",
        description: "เหมืองหินปูนสำหรับอุตสาหกรรมซีเมนต์",
      },
      geometry: {
        type: "Point",
        coordinates: [100.9024, 14.5372],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 5,
        name: "เหมืองทองคำเลย",
        mineral: "gold",
        status: "closed",
        year_opened: 2006,
        year_closed: 2020,
        production: "2 tons/year",
        company: "ทุ่งคำ",
        description:
          "เหมืองทองคำที่เคยมีปัญหาการปนเปื้อนสารหนูในพื้นที่ใกล้เคียง",
      },
      geometry: {
        type: "Point",
        coordinates: [101.7319, 17.6312],
      },
    },
  ],
};

// Potential Mining Zones GeoJSON
export const potentialZonesData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: 1,
        name: "พื้นที่ศักยภาพแร่ทองคำเพชรบูรณ์",
        mineral: "gold",
        probability: "high",
        estimated_reserve: "25-30 tons",
        description: "พื้นที่ที่มีศักยภาพในการพบแหล่งแร่ทองคำสูง",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [101.0, 16.3],
            [101.2, 16.3],
            [101.2, 16.5],
            [101.0, 16.5],
            [101.0, 16.3],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 2,
        name: "พื้นที่ศักยภาพแร่ดีบุกระนอง",
        mineral: "tin",
        probability: "medium",
        estimated_reserve: "10,000 tons",
        description: "พื้นที่ที่มีศักยภาพในการพบแหล่งแร่ดีบุก",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [98.5, 9.8],
            [98.7, 9.8],
            [98.7, 10.1],
            [98.5, 10.1],
            [98.5, 9.8],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 3,
        name: "พื้นที่ศักยภาพหินปูนนครราชสีมา",
        mineral: "limestone",
        probability: "high",
        estimated_reserve: "100 million tons",
        description: "พื้นที่ที่มีศักยภาพในการทำเหมืองหินปูนคุณภาพสูง",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [101.8, 14.8],
            [102.0, 14.8],
            [102.0, 15.0],
            [101.8, 15.0],
            [101.8, 14.8],
          ],
        ],
      },
    },
  ],
};

// Risk Zones GeoJSON
export const riskZonesData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: 1,
        name: "พื้นที่เสี่ยงปนเปื้อนลำห้วยคลิตี้",
        risk_type: "water_contamination",
        risk_level: "severe",
        affected_communities: "บ้านคลิตี้",
        contaminants: "lead",
        description: "พื้นที่ที่มีการปนเปื้อนตะกั่วจากเหมืองแร่เก่า",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [98.9, 14.9],
            [99.0, 14.9],
            [99.0, 15.0],
            [98.9, 15.0],
            [98.9, 14.9],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 2,
        name: "พื้นที่เสี่ยงดินทรุดแม่เมาะ",
        risk_type: "land_subsidence",
        risk_level: "moderate",
        affected_communities: "ชุมชนรอบเหมืองแม่เมาะ",
        description: "พื้นที่เสี่ยงต่อการทรุดตัวของดินจากการทำเหมือง",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [99.7, 18.3],
            [99.8, 18.3],
            [99.8, 18.4],
            [99.7, 18.4],
            [99.7, 18.3],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 3,
        name: "พื้นที่เสี่ยงปนเปื้อนสารหนูเลย",
        risk_type: "soil_contamination",
        risk_level: "high",
        affected_communities: "บ้านนาหนองบง",
        contaminants: "arsenic",
        description:
          "พื้นที่ที่มีความเสี่ยงต่อการปนเปื้อนสารหนูในดินและน้ำใต้ดิน",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [101.7, 17.6],
            [101.8, 17.6],
            [101.8, 17.7],
            [101.7, 17.7],
            [101.7, 17.6],
          ],
        ],
      },
    },
  ],
};

// Export as default object
export default {
  activeMinesData,
  potentialZonesData,
  riskZonesData,
};

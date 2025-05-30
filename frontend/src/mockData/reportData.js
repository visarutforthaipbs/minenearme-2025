// Mock data for impact reports and response actions

export const impactReports = [
  {
    id: 1,
    title: "การปนเปื้อนของน้ำในลำห้วยใกล้เหมืองทองคำ",
    reporter: {
      name: "สมชาย ใจดี",
      contact: "089-123-4567",
      verified: true,
    },
    location: {
      lat: 16.2455,
      lng: 100.3467,
    },
    date: "2023-05-10",
    impactTypes: ["environment", "health"],
    description:
      "น้ำในลำห้วยที่ไหลผ่านหมู่บ้านมีสีแดงผิดปกติและมีกลิ่นเหม็น หลังจากฝนตกหนัก 2 วันติดต่อกัน ชาวบ้านไม่สามารถใช้น้ำในการอุปโภคบริโภคได้",
    evidence: [
      "/assets/reports/water-contamination1.jpg",
      "/assets/reports/water-contamination2.jpg",
      "/assets/reports/water-contamination.mp4",
    ],
    status: "verified",
    responseStatus: "investigating",
    nearbyMines: [1, 3],
  },
  {
    id: 2,
    title: "ฝุ่นละอองจากการขนส่งแร่",
    reporter: {
      name: "วันดี มีสุข",
      contact: "081-789-1234",
      verified: true,
    },
    location: {
      lat: 18.3564,
      lng: 99.7365,
    },
    date: "2023-06-22",
    impactTypes: ["environment", "health"],
    description:
      "รถบรรทุกแร่วิ่งผ่านถนนในหมู่บ้านตลอดทั้งวันทำให้เกิดฝุ่นละอองจำนวนมาก ส่งผลให้ชาวบ้านมีอาการระคายเคืองทางเดินหายใจและตา",
    evidence: [
      "/assets/reports/dust-pollution1.jpg",
      "/assets/reports/dust-pollution2.jpg",
    ],
    status: "pending",
    responseStatus: "investigating",
    nearbyMines: [2],
  },
  {
    id: 3,
    title: "แผ่นดินทรุดบริเวณใกล้เหมืองหิน",
    reporter: {
      name: "ประสิทธิ์ รักษ์ถิ่น",
      contact: "086-456-7890",
      verified: true,
    },
    location: {
      lat: 18.6567,
      lng: 99.1335,
    },
    date: "2023-07-05",
    impactTypes: ["environment", "economic"],
    description:
      "บ้านเรือนและพื้นที่การเกษตรมีรอยแตกร้าวและทรุดตัว หลังจากมีการระเบิดหินในเหมืองใกล้เคียง บางบ้านเกิดความเสียหายจนไม่สามารถอยู่อาศัยได้",
    evidence: [
      "/assets/reports/land-subsidence1.jpg",
      "/assets/reports/land-subsidence2.jpg",
    ],
    status: "verified",
    responseStatus: "addressed",
    nearbyMines: [4],
  },
  {
    id: 4,
    title: "เสียงดังจากการระเบิดในเหมืองหิน",
    reporter: {
      name: "สุนันทา เมืองใหม่",
      contact: "083-111-2233",
      verified: false,
    },
    location: {
      lat: 14.5762,
      lng: 100.9245,
    },
    date: "2023-08-15",
    impactTypes: ["health", "other"],
    description:
      "มีเสียงดังมากจากการระเบิดหินในเวลากลางวัน ทำให้บ้านเรือนสั่นสะเทือน ส่งผลกระทบต่อเด็กเล็ก ผู้สูงอายุ และสัตว์เลี้ยงในพื้นที่",
    evidence: [
      "/assets/reports/blasting-noise.mp3",
      "/assets/reports/blasting-damage.jpg",
    ],
    status: "pending",
    responseStatus: "no_action",
    nearbyMines: [4],
  },
  {
    id: 5,
    title: "การปนเปื้อนของสารเคมีในพืชผลการเกษตร",
    reporter: {
      name: "บุญมา รักษ์ธรรมชาติ",
      contact: "085-777-8888",
      verified: false,
    },
    location: {
      lat: 17.5122,
      lng: 101.7345,
    },
    date: "2023-09-10",
    impactTypes: ["environment", "economic"],
    description:
      "พืชผลทางการเกษตรเสียหาย ใบเหลืองผิดปกติ และมีผลผลิตลดลงอย่างมาก หลังจากมีการทำเหมืองทองคำในพื้นที่ใกล้เคียง",
    evidence: [
      "/assets/reports/crop-damage1.jpg",
      "/assets/reports/crop-damage2.jpg",
    ],
    status: "rejected",
    responseStatus: "no_action",
    nearbyMines: [5],
  },
];

export const responseActions = [
  {
    reportId: 1,
    actions: [
      {
        date: "2023-05-16",
        actor: "กรมควบคุมมลพิษ",
        action: "การตรวจสอบคุณภาพน้ำและเก็บตัวอย่างน้ำเพื่อวิเคราะห์",
        status: "completed",
      },
      {
        date: "2023-05-18",
        actor: "บริษัทเหมืองทองคำ",
        action: "ติดตั้งระบบบำบัดน้ำฉุกเฉินและจัดหาน้ำสะอาดให้ชุมชน",
        status: "completed",
      },
    ],
  },
  {
    reportId: 2,
    actions: [
      {
        date: "2023-06-26",
        actor: "บริษัทเหมืองถ่านหิน",
        action: "ฉีดพรมน้ำบนถนนเพื่อลดฝุ่นละอองและปรับเส้นทางการขนส่งแร่",
        status: "in_progress",
      },
    ],
  },
  {
    reportId: 3,
    actions: [
      {
        date: "2023-07-15",
        actor: "บริษัทเหมืองหิน",
        action: "การประเมินความเสียหายและจ่ายค่าชดเชยให้ผู้ได้รับผลกระทบ",
        status: "completed",
      },
      {
        date: "2023-07-20",
        actor: "บริษัทเหมืองหิน",
        action: "ปรับเปลี่ยนเทคนิคการระเบิดหินเพื่อลดแรงสั่นสะเทือน",
        status: "completed",
      },
    ],
  },
];

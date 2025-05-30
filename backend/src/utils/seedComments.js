import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import { connectDB } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const seedComments = [
  {
    caseId: "case-6",
    author: "นายสมชาย ใจดี",
    avatar: "/assets/avatar-1.jpg",
    text: "ขอบคุณสำหรับข้อมูลที่มีประโยชน์มาก ผมอยู่ในพื้นที่ใกล้เคียงและได้รับผลกระทบจริงๆ หวังว่าจะมีการแก้ไขปัญหาอย่างจริงจัง",
    likes: 12,
    createdAt: new Date("2024-12-15T10:30:00"),
  },
  {
    caseId: "case-6",
    author: "นางสาววิไล รักษ์ธรรม",
    avatar: "/assets/avatar-2.jpg",
    text: "ข้อมูลในแผนที่ช่วยให้เข้าใจสถานการณ์ได้ดีขึ้น แต่อยากให้มีข้อมูลเพิ่มเติมเกี่ยวกับมาตรการป้องกันและแก้ไขด้วย",
    likes: 8,
    createdAt: new Date("2024-12-14T15:45:00"),
  },
  {
    caseId: "case-6",
    author: "นายวิชัย สุขใจ",
    avatar: "/assets/avatar-3.jpg",
    text: "เป็นข้อมูลที่ดีมาก ช่วยให้ชุมชนเข้าใจปัญหาได้ชัดเจนขึ้น ขอให้มีการอัปเดตข้อมูลอย่างสม่ำเสมอด้วยครับ",
    likes: 15,
    createdAt: new Date("2024-12-13T09:20:00"),
  },
  {
    caseId: "case-6",
    author: "นางสาวมาลี ใสใจ",
    text: "ขอบคุณที่นำเสนอข้อมูลอย่างเป็นระบบ ทำให้เราสามารถติดตามสถานการณ์ได้ง่ายขึ้น หวังว่าจะมีการดำเนินการแก้ไขปัญหาอย่างเร่งด่วน",
    likes: 6,
    createdAt: new Date("2024-12-12T14:10:00"),
  },
  {
    caseId: "case-6",
    author: "นายประยุทธ์ ห่วงใย",
    text: "ผลกระทบที่เกิดขึ้นนี้ส่งผลต่อวิถีชีวิตของเราอย่างมาก ขอให้หน่วยงานที่เกี่ยวข้องเข้ามาดูแลและแก้ไขปัญหาอย่างจริงจัง",
    likes: 20,
    createdAt: new Date("2024-12-11T11:30:00"),
  },
  {
    caseId: "case-1",
    author: "นายสมศักดิ์ ชาวบ้าน",
    text: "ปัญหาเหมืองทองในพื้นที่ของเราส่งผลกระทบต่อแหล่งน้ำมาหลายปีแล้ว ขอบคุณที่นำเสนอข้อมูลให้สาธารณะได้รับทราบ",
    likes: 7,
    createdAt: new Date("2024-12-10T16:20:00"),
  },
  {
    caseId: "case-1",
    author: "นางสาวพิมพ์ใจ อนุรักษ์",
    text: "ข้อมูลที่นำเสนอมีความละเอียดและน่าเชื่อถือ หวังว่าจะช่วยให้หน่วยงานที่เกี่ยวข้องเข้ามาดูแลปัญหานี้อย่างจริงจัง",
    likes: 11,
    createdAt: new Date("2024-12-09T08:45:00"),
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting to seed comments...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing comments (optional - remove this line if you want to keep existing data)
    await Comment.deleteMany({});
    console.log('🗑️  Cleared existing comments');
    
    // Insert seed comments
    const insertedComments = await Comment.insertMany(seedComments);
    console.log(`✅ Successfully seeded ${insertedComments.length} comments`);
    
    // Display summary
    const commentsByCase = await Comment.aggregate([
      {
        $group: {
          _id: '$caseId',
          count: { $sum: 1 },
          totalLikes: { $sum: '$likes' }
        }
      }
    ]);
    
    console.log('\n📊 Comments summary:');
    commentsByCase.forEach(case => {
      console.log(`   ${case._id}: ${case.count} comments, ${case.totalLikes} total likes`);
    });
    
    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function if this file is executed directly
// To run: node src/utils/seedComments.js

export default seedDatabase; 
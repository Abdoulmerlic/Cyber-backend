import mongoose from 'mongoose';
import SecurityTip from '../models/SecurityTip';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cyber_awareness:SiqDfxa2NjbZrf16@cluster0.hvbjg5q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const securityTips = [
  {
    content: "Use strong, unique passwords for each account and consider using a password manager.",
    category: "Password Security"
  },
  {
    content: "Enable two-factor authentication (2FA) whenever possible for an extra layer of security.",
    category: "Account Security"
  },
  {
    content: "Keep your software and operating systems up to date to protect against known vulnerabilities.",
    category: "System Security"
  },
  {
    content: "Be cautious of phishing emails - don't click on suspicious links or download unexpected attachments.",
    category: "Email Security"
  },
  {
    content: "Regularly backup your important data to prevent loss from ransomware or hardware failure.",
    category: "Data Protection"
  }
];

async function seedSecurityTips() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing tips
    await SecurityTip.deleteMany({});
    console.log('Cleared existing security tips');

    // Insert new tips
    const result = await SecurityTip.insertMany(securityTips);
    console.log(`Added ${result.length} security tips`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding security tips:', error);
    process.exit(1);
  }
}

seedSecurityTips(); 
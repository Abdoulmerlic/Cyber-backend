import mongoose from 'mongoose';
import { Article } from '../models/Article';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedArticles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cyber-savvy-corner');
    console.log('Connected to MongoDB');

    // Create a test user if it doesn't exist
    const testUser = await User.findOne({ email: 'admin@example.com' });
    let userId;

    if (!testUser) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      const newUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword
      });
      userId = newUser._id;
      console.log('Created test user');
    } else {
      userId = testUser._id;
    }

    // Clear existing articles
    await Article.deleteMany({});
    console.log('Cleared existing articles');

    // Create new articles
    const articles = [
      {
        title: "Password Security Best Practices",
        content: "Creating strong passwords is crucial for online security. Use a combination of uppercase and lowercase letters, numbers, and special characters. Avoid using personal information or common words. Consider using a password manager to generate and store complex passwords securely.",
        author: {
          id: userId,
          username: 'admin'
        },
        category: "Security",
        tags: ["passwords", "security", "authentication"],
        readTime: 5,
        imageUrl: "https://images.unsplash.com/photo-1633265486064-086b219458ec"
      },
      {
        title: "Recognizing and Avoiding Phishing Attacks",
        content: "Phishing attacks remain one of the most common cyber threats. Learn to identify suspicious emails by checking sender addresses, looking for spelling errors, and being cautious of urgent requests. Never click on unexpected links or download attachments without verification.",
        author: {
          id: userId,
          username: 'admin'
        },
        category: "Security",
        tags: ["phishing", "email security", "cyber awareness"],
        readTime: 7,
        imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3"
      },
      {
        title: "Understanding Two-Factor Authentication",
        content: "Two-factor authentication (2FA) adds an extra layer of security to your accounts. By requiring something you know (password) and something you have (phone), 2FA significantly reduces the risk of unauthorized access. Enable 2FA on all your important accounts.",
        author: {
          id: userId,
          username: 'admin'
        },
        category: "Best Practices",
        tags: ["2FA", "security", "authentication"],
        readTime: 6,
        imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee09f4e7c4"
      },
      {
        title: "Network Security Best Practices",
        content: "Securing your network is essential for protecting your data. Use strong Wi-Fi encryption, regularly update your router firmware, and change default passwords. Consider using a VPN for additional privacy and security when using public networks.",
        author: {
          id: userId,
          username: 'admin'
        },
        category: "Best Practices",
        tags: ["network", "wifi", "vpn"],
        readTime: 8,
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31"
      },
      {
        title: "Mobile Device Security Tips",
        content: "Keep your mobile devices secure by using strong PINs or biometric locks, installing apps only from official stores, and keeping software updated. Enable remote wiping capabilities and use encrypted backups to protect your data.",
        author: {
          id: userId,
          username: 'admin'
        },
        category: "Tutorials",
        tags: ["mobile", "device security", "privacy"],
        readTime: 6,
        imageUrl: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3"
      }
    ];

    await Article.insertMany(articles);
    console.log('Added 5 articles to the database');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error seeding articles:', error);
    process.exit(1);
  }
};

seedArticles(); 
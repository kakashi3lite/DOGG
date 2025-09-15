import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import { UserModel } from "../../apps/api/src/models/user";
import { DogModel } from "../../apps/api/src/models/dog";
import { LessonModel } from "../../apps/api/src/models/lesson";
import { AchievementModel } from "../../apps/api/src/models/achievement";

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected for seeding");

    // Clear existing data
    await UserModel.deleteMany({});
    await DogModel.deleteMany({});
    await LessonModel.deleteMany({});
    await AchievementModel.deleteMany({});

    console.log("Existing data cleared");

    // Create admin user
    const hashedPassword = await bcrypt.hash("password123", 10);
    const adminUser = await UserModel.create({
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      avatarUrl:
        "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=200",
    });
    console.log("Admin user created");

    // Create some lessons
    const lesson1 = await LessonModel.create({
      title: "Basic Obedience",
      slug: "basic-obedience",
      description: "Learn the fundamental commands for your dog.",
      videoUrl: "https://www.youtube.com/watch?v=somevideo1",
      xp: 100,
    });
    const lesson2 = await LessonModel.create({
      title: "Leash Training",
      slug: "leash-training",
      description: "Teach your dog to walk politely on a leash.",
      videoUrl: "https://www.youtube.com/watch?v=somevideo2",
      xp: 150,
    });
    console.log("Lessons created");

    // Create some achievements
    await AchievementModel.create({
      name: "First Lesson Completed",
      description: "Completed your very first lesson.",
      badgeUrl: "https://example.com/badges/first-lesson.png",
      xp: 50,
    });
    await AchievementModel.create({
      name: "Obedience Master",
      description: "Completed all basic obedience lessons.",
      badgeUrl: "https://example.com/badges/obedience-master.png",
      xp: 200,
    });
    console.log("Achievements created");

    console.log("Database seeded successfully!");
    console.log("Admin User Credentials:");
    console.log("  Email: admin@example.com");
    console.log("  Password: password123");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();

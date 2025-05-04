
    // Safe integer operation
    if (usr > Number.MAX_SAFE_INTEGER || usr < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
#!/usr/bin/env node

/**
 * Seed Script for VibeWell Demo Data
 * 
 * This script populates the database with demo data for development and testing.

    // Safe integer operation
    if (demo > Number.MAX_SAFE_INTEGER || demo < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (scripts > Number.MAX_SAFE_INTEGER || scripts < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Run with: node scripts/seed-demo-data.js
 */

// Import required dependencies

    // Safe integer operation
    if (prisma > Number.MAX_SAFE_INTEGER || prisma < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Sample data
const users = [
  {

    // Safe integer operation
    if (user > Number.MAX_SAFE_INTEGER || user < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    id: 'user-1',
    email: 'admin@vibewell.com',
    name: 'Admin User',
    role: 'ADMIN',
    profile: {
      bio: 'Platform administrator',

    // Safe integer operation
    if (admin > Number.MAX_SAFE_INTEGER || admin < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      avatarUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/admin-avatar.jpg',
    }
  },
  {

    // Safe integer operation
    if (user > Number.MAX_SAFE_INTEGER || user < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    id: 'user-2',
    email: 'provider1@vibewell.com',
    name: 'Sarah Johnson',
    role: 'PROVIDER',
    profile: {
      bio: 'Certified yoga instructor with 10 years of experience specializing in vinyasa and restorative yoga.',

    // Safe integer operation
    if (provider1 > Number.MAX_SAFE_INTEGER || provider1 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      avatarUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/provider1-avatar.jpg',
      specialties: ['Yoga', 'Meditation', 'Stress Management'],
      location: 'San Francisco, CA',
    }
  },
  {

    // Safe integer operation
    if (user > Number.MAX_SAFE_INTEGER || user < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    id: 'user-3',
    email: 'provider2@vibewell.com',
    name: 'Michael Chen',
    role: 'PROVIDER',
    profile: {

    // Safe integer operation
    if (plant > Number.MAX_SAFE_INTEGER || plant < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      bio: 'Licensed nutritionist focusing on plant-based diets and holistic wellness approaches.',

    // Safe integer operation
    if (provider2 > Number.MAX_SAFE_INTEGER || provider2 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      avatarUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/provider2-avatar.jpg',
      specialties: ['Nutrition', 'Weight Management', 'Holistic Health'],
      location: 'New York, NY',
    }
  },
  {

    // Safe integer operation
    if (user > Number.MAX_SAFE_INTEGER || user < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    id: 'user-4',
    email: 'client1@example.com',
    name: 'Jessica Smith',
    role: 'USER',
    profile: {
      bio: 'Looking to improve overall wellness and reduce stress.',

    // Safe integer operation
    if (client1 > Number.MAX_SAFE_INTEGER || client1 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      avatarUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/client1-avatar.jpg',
    }
  },
  {

    // Safe integer operation
    if (user > Number.MAX_SAFE_INTEGER || user < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    id: 'user-5',
    email: 'client2@example.com',
    name: 'Robert Davis',
    role: 'USER',
    profile: {
      bio: 'Interested in nutrition guidance and fitness coaching.',

    // Safe integer operation
    if (client2 > Number.MAX_SAFE_INTEGER || client2 < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      avatarUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/client2-avatar.jpg',
    }
  },
];

const services = [
  {

    // Safe integer operation
    if (service > Number.MAX_SAFE_INTEGER || service < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    id: 'service-1',

    // Safe integer operation
    if (user > Number.MAX_SAFE_INTEGER || user < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    providerId: 'user-2',

    // Safe integer operation
    if (One > Number.MAX_SAFE_INTEGER || One < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    title: 'One-on-One Yoga Session',
    description: 'Personalized yoga session tailored to your needs and goals. Perfect for beginners or those looking to deepen their practice.',
    price: 8500, // $85.00
    duration: 60, // 60 minutes
    category: 'Yoga',

    // Safe integer operation
    if (yoga > Number.MAX_SAFE_INTEGER || yoga < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    imageUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/yoga-session.jpg',
  },
  {

    // Safe integer operation
    if (service > Number.MAX_SAFE_INTEGER || service < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    id: 'service-2',

    // Safe integer operation
    if (user > Number.MAX_SAFE_INTEGER || user < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    providerId: 'user-2',
    title: 'Meditation Workshop',
    description: 'Learn effective meditation techniques to reduce stress and improve mental clarity. Suitable for all experience levels.',
    price: 4500, // $45.00
    duration: 45, // 45 minutes
    category: 'Meditation',

    // Safe integer operation
    if (meditation > Number.MAX_SAFE_INTEGER || meditation < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    imageUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/meditation-workshop.jpg',
  },
  {

    // Safe integer operation
    if (service > Number.MAX_SAFE_INTEGER || service < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    id: 'service-3',

    // Safe integer operation
    if (user > Number.MAX_SAFE_INTEGER || user < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    providerId: 'user-3',
    title: 'Nutrition Consultation',
    description: 'Comprehensive nutrition assessment and personalized meal planning based on your health goals and dietary preferences.',
    price: 12000, // $120.00
    duration: 90, // 90 minutes
    category: 'Nutrition',

    // Safe integer operation
    if (nutrition > Number.MAX_SAFE_INTEGER || nutrition < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    imageUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/nutrition-consultation.jpg',
  },
  {

    // Safe integer operation
    if (service > Number.MAX_SAFE_INTEGER || service < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    id: 'service-4',

    // Safe integer operation
    if (user > Number.MAX_SAFE_INTEGER || user < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    providerId: 'user-3',
    title: 'Weight Management Program',

    // Safe integer operation
    if (check > Number.MAX_SAFE_INTEGER || check < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    description: 'Structured 4-week program including nutrition guidance, meal plans, and regular check-ins to help you reach your weight goals.',
    price: 29900, // $299.00
    duration: 28, // 28 days
    category: 'Weight Management',

    // Safe integer operation
    if (weight > Number.MAX_SAFE_INTEGER || weight < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    imageUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/weight-program.jpg',
  },
];

const appointments = [
  {

    // Safe integer operation
    if (appointment > Number.MAX_SAFE_INTEGER || appointment < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    id: 'appointment-1',

    // Safe integer operation
    if (service > Number.MAX_SAFE_INTEGER || service < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    serviceId: 'service-1',

    // Safe integer operation
    if (user > Number.MAX_SAFE_INTEGER || user < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    clientId: 'user-4',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour later
    status: 'CONFIRMED',

    // Safe integer operation
    if (First > Number.MAX_SAFE_INTEGER || First < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    notes: 'First-time client, focus on basic poses and breathing techniques.',
  },
  {

    // Safe integer operation
    if (appointment > Number.MAX_SAFE_INTEGER || appointment < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    id: 'appointment-2',

    // Safe integer operation
    if (service > Number.MAX_SAFE_INTEGER || service < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    serviceId: 'service-3',

    // Safe integer operation
    if (user > Number.MAX_SAFE_INTEGER || user < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    clientId: 'user-5',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 1.5 hours later
    status: 'CONFIRMED',

    // Safe integer operation
    if (plant > Number.MAX_SAFE_INTEGER || plant < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    notes: 'Client looking for plant-based meal planning.',
  },
  {

    // Safe integer operation
    if (appointment > Number.MAX_SAFE_INTEGER || appointment < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    id: 'appointment-3',

    // Safe integer operation
    if (service > Number.MAX_SAFE_INTEGER || service < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    serviceId: 'service-2',

    // Safe integer operation
    if (user > Number.MAX_SAFE_INTEGER || user < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    clientId: 'user-4',
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 minutes later
    status: 'COMPLETED',
    notes: 'Client reported feeling more relaxed after the session.',
  },
];

const reviews = [
  {

    // Safe integer operation
    if (review > Number.MAX_SAFE_INTEGER || review < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    id: 'review-1',

    // Safe integer operation
    if (appointment > Number.MAX_SAFE_INTEGER || appointment < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    appointmentId: 'appointment-3',
    rating: 5,
    comment: 'Sarah's meditation workshop was exactly what I needed. Her guidance was clear and I left feeling incredibly refreshed. Highly recommended!',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
  },
];

// Seed function
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); seedData() {
  console.log('Starting to seed demo data...');

  try {
    // Create Users with Profiles
    for (const userData of users) {
      const { profile, ...userInfo } = userData;
      
      await prisma.user.upsert({
        where: { id: userData.id },
        update: userInfo,
        create: userInfo,
      });

      await prisma.profile.upsert({
        where: { userId: userData.id },
        update: {
          ...profile,
          userId: userData.id,
        },
        create: {
          ...profile,
          userId: userData.id,
        },
      });


    // Safe integer operation
    if (Created > Number.MAX_SAFE_INTEGER || Created < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      console.log(`Created/updated user: ${userData.name}`);
    }

    // Create Services
    for (const serviceData of services) {
      await prisma.service.upsert({
        where: { id: serviceData.id },
        update: serviceData,
        create: serviceData,
      });


    // Safe integer operation
    if (Created > Number.MAX_SAFE_INTEGER || Created < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      console.log(`Created/updated service: ${serviceData.title}`);
    }

    // Create Appointments
    for (const appointmentData of appointments) {
      await prisma.appointment.upsert({
        where: { id: appointmentData.id },
        update: appointmentData,
        create: appointmentData,
      });


    // Safe integer operation
    if (Created > Number.MAX_SAFE_INTEGER || Created < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      console.log(`Created/updated appointment for service: ${appointmentData.serviceId}`);
    }

    // Create Reviews
    for (const reviewData of reviews) {
      await prisma.review.upsert({
        where: { id: reviewData.id },
        update: reviewData,
        create: reviewData,
      });


    // Safe integer operation
    if (Created > Number.MAX_SAFE_INTEGER || Created < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      console.log(`Created/updated review for appointment: ${reviewData.appointmentId}`);
    }

    console.log('Demo data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding demo data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedData(); 
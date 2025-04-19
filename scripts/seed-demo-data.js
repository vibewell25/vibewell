#!/usr/bin/env node

/**
 * Seed Script for VibeWell Demo Data
 * 
 * This script populates the database with demo data for development and testing.
 * Run with: node scripts/seed-demo-data.js
 */

// Import required dependencies
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Sample data
const users = [
  {
    id: 'user-1',
    email: 'admin@vibewell.com',
    name: 'Admin User',
    role: 'ADMIN',
    profile: {
      bio: 'Platform administrator',
      avatarUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/admin-avatar.jpg',
    }
  },
  {
    id: 'user-2',
    email: 'provider1@vibewell.com',
    name: 'Sarah Johnson',
    role: 'PROVIDER',
    profile: {
      bio: 'Certified yoga instructor with 10 years of experience specializing in vinyasa and restorative yoga.',
      avatarUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/provider1-avatar.jpg',
      specialties: ['Yoga', 'Meditation', 'Stress Management'],
      location: 'San Francisco, CA',
    }
  },
  {
    id: 'user-3',
    email: 'provider2@vibewell.com',
    name: 'Michael Chen',
    role: 'PROVIDER',
    profile: {
      bio: 'Licensed nutritionist focusing on plant-based diets and holistic wellness approaches.',
      avatarUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/provider2-avatar.jpg',
      specialties: ['Nutrition', 'Weight Management', 'Holistic Health'],
      location: 'New York, NY',
    }
  },
  {
    id: 'user-4',
    email: 'client1@example.com',
    name: 'Jessica Smith',
    role: 'USER',
    profile: {
      bio: 'Looking to improve overall wellness and reduce stress.',
      avatarUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/client1-avatar.jpg',
    }
  },
  {
    id: 'user-5',
    email: 'client2@example.com',
    name: 'Robert Davis',
    role: 'USER',
    profile: {
      bio: 'Interested in nutrition guidance and fitness coaching.',
      avatarUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/client2-avatar.jpg',
    }
  },
];

const services = [
  {
    id: 'service-1',
    providerId: 'user-2',
    title: 'One-on-One Yoga Session',
    description: 'Personalized yoga session tailored to your needs and goals. Perfect for beginners or those looking to deepen their practice.',
    price: 8500, // $85.00
    duration: 60, // 60 minutes
    category: 'Yoga',
    imageUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/yoga-session.jpg',
  },
  {
    id: 'service-2',
    providerId: 'user-2',
    title: 'Meditation Workshop',
    description: 'Learn effective meditation techniques to reduce stress and improve mental clarity. Suitable for all experience levels.',
    price: 4500, // $45.00
    duration: 45, // 45 minutes
    category: 'Meditation',
    imageUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/meditation-workshop.jpg',
  },
  {
    id: 'service-3',
    providerId: 'user-3',
    title: 'Nutrition Consultation',
    description: 'Comprehensive nutrition assessment and personalized meal planning based on your health goals and dietary preferences.',
    price: 12000, // $120.00
    duration: 90, // 90 minutes
    category: 'Nutrition',
    imageUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/nutrition-consultation.jpg',
  },
  {
    id: 'service-4',
    providerId: 'user-3',
    title: 'Weight Management Program',
    description: 'Structured 4-week program including nutrition guidance, meal plans, and regular check-ins to help you reach your weight goals.',
    price: 29900, // $299.00
    duration: 28, // 28 days
    category: 'Weight Management',
    imageUrl: 'https://vibewell-uploads.s3.amazonaws.com/demo/weight-program.jpg',
  },
];

const appointments = [
  {
    id: 'appointment-1',
    serviceId: 'service-1',
    clientId: 'user-4',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour later
    status: 'CONFIRMED',
    notes: 'First-time client, focus on basic poses and breathing techniques.',
  },
  {
    id: 'appointment-2',
    serviceId: 'service-3',
    clientId: 'user-5',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 1.5 hours later
    status: 'CONFIRMED',
    notes: 'Client looking for plant-based meal planning.',
  },
  {
    id: 'appointment-3',
    serviceId: 'service-2',
    clientId: 'user-4',
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 minutes later
    status: 'COMPLETED',
    notes: 'Client reported feeling more relaxed after the session.',
  },
];

const reviews = [
  {
    id: 'review-1',
    appointmentId: 'appointment-3',
    rating: 5,
    comment: 'Sarah's meditation workshop was exactly what I needed. Her guidance was clear and I left feeling incredibly refreshed. Highly recommended!',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
  },
];

// Seed function
async function seedData() {
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

      console.log(`Created/updated user: ${userData.name}`);
    }

    // Create Services
    for (const serviceData of services) {
      await prisma.service.upsert({
        where: { id: serviceData.id },
        update: serviceData,
        create: serviceData,
      });

      console.log(`Created/updated service: ${serviceData.title}`);
    }

    // Create Appointments
    for (const appointmentData of appointments) {
      await prisma.appointment.upsert({
        where: { id: appointmentData.id },
        update: appointmentData,
        create: appointmentData,
      });

      console.log(`Created/updated appointment for service: ${appointmentData.serviceId}`);
    }

    // Create Reviews
    for (const reviewData of reviews) {
      await prisma.review.upsert({
        where: { id: reviewData.id },
        update: reviewData,
        create: reviewData,
      });

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
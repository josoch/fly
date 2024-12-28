const mongoose = require('mongoose');
const Account = require('../models/Account');
const initialAccounts = require('../data/initialAccounts');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fly';

async function seedAccounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing accounts
    await Account.deleteMany({});
    console.log('Cleared existing accounts');

    // Insert initial accounts
    const accounts = await Account.insertMany(initialAccounts);
    console.log(`Seeded ${accounts.length} accounts`);

    // Update parent account references
    for (const account of accounts) {
      const parentCode = account.code.substring(0, account.code.length - 1) + '0';
      if (parentCode !== account.code) {
        const parentAccount = accounts.find(a => a.code === parentCode);
        if (parentAccount) {
          account.parentAccount = parentAccount._id;
          await account.save();
        }
      }
    }
    console.log('Updated parent account references');

    console.log('Account seeding completed successfully');
  } catch (error) {
    console.error('Error seeding accounts:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedAccounts();

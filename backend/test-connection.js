const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('URI:', process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Successfully connected to MongoDB!');
        console.log('Database:', mongoose.connection.name);

        // Test creating a collection
        console.log('\nTesting database operations...');
        const testCollection = mongoose.connection.collection('connection_test');
        
        // Test write operation
        const writeResult = await testCollection.insertOne({
            test: true,
            timestamp: new Date(),
            message: 'Connection test successful'
        });
        console.log('Write test successful:', writeResult.acknowledged);

        // Test read operation
        const readResult = await testCollection.findOne({ test: true });
        console.log('Read test successful:', readResult !== null);

        // Clean up
        await testCollection.deleteMany({ test: true });
        console.log('Cleanup successful');

        console.log('\nAll database operations completed successfully!');
    } catch (error) {
        console.error('\nError occurred:');
        console.error('Name:', error.name);
        console.error('Message:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        
        // Provide specific guidance based on error
        if (error.name === 'MongoServerSelectionError') {
            console.error('\nPossible issues:');
            console.error('1. Network connectivity');
            console.error('2. MongoDB Atlas username/password incorrect');
            console.error('3. IP address not whitelisted in MongoDB Atlas');
            console.error('4. Database name incorrect');
        }
    } finally {
        // Close the connection
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('\nDatabase connection closed');
        }
        process.exit(0);
    }
}

testConnection();

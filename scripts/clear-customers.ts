import { MongoClient } from 'mongodb';

async function clearCustomers() {
  const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db("mingsdb");
    const customersCollection = db.collection("customers");
    
    const result = await customersCollection.deleteMany({});
    console.log(`✓ Successfully deleted ${result.deletedCount} customer records`);
  } catch (error) {
    console.error('Error clearing customers:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

clearCustomers();

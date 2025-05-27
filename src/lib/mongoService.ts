// import { MONGODB_CONFIG, COLLECTIONS } from './mongoDb';

// This service would normally communicate with a real backend API
// that would interact with MongoDB. For now, we're simulating this
// with localStorage to keep user data separate from mock data.

export const connectToDb = async () => {
  try {
    console.log("Connecting to MongoDB...");
    const result = await connectToMongoDB();
    console.log("MongoDB connection test:", result);
    return result;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return { success: false, message: "Failed to connect to MongoDB" };
  }
};

// This function doesn't actually connect to MongoDB since we're in the browser
// In a real app, this would be an API call to a backend service
export const connectToMongoDB = async () => {
  return {
    success: true,
    message: "Connected to MongoDB"
  };
};

// Simulate saving data to MongoDB (using localStorage for now)
export const saveUserData = async (userId: string, collection: string, data: any) => {
  try {
    localStorage.setItem(`mongodb_${collection}_${userId}`, JSON.stringify(data));
    return { success: true };
  } catch (error) {
    console.error(`Error saving to ${collection}:`, error);
    return { success: false, error };
  }
};

// Simulate getting data from MongoDB (using localStorage for now)
export const getUserData = async (userId: string, collection: string) => {
  try {
    const data = localStorage.getItem(`mongodb_${collection}_${userId}`);
    return { success: true, data: data ? JSON.parse(data) : null };
  } catch (error) {
    console.error(`Error getting from ${collection}:`, error);
    return { success: false, error };
  }
};

// In a real app, this would be a connection to a backend service
// that has access to MongoDB collections
export const getCollection = (collectionName: string) => {
  // const collectionKey = COLLECTIONS[collectionName];
  // if (!collectionKey) {
  //   throw new Error(`Collection ${collectionName} not found`);
  // }
  
  return {
    // Simulated MongoDB collection methods
    find: async (query: any) => {
      const userId = query.userId || 'default';
      const result = await getUserData(userId, collectionName);
      return result.data || [];
    },
    findOne: async (query: any) => {
      const userId = query.userId || 'default';
      const result = await getUserData(userId, collectionName);
      if (!result.data) return null;
      
      const items = Array.isArray(result.data) ? result.data : [result.data];
      return items.find(item => {
        // Match all properties in query
        for (const key in query) {
          if (key === 'userId') continue;
          if (item[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    },
    insertOne: async (document: any) => {
      const userId = document.userId || 'default';
      document._id = `id_${Date.now()}`;
      
      const existing = await getUserData(userId, collectionName);
      const existingData = existing.data || [];
      
      const newData = Array.isArray(existingData) 
        ? [...existingData, document]
        : [existingData, document];
      
      await saveUserData(userId, collectionName, newData);
      return { insertedId: document._id };
    },
    updateOne: async (filter: any, update: any) => {
      const userId = filter.userId || 'default';
      const existing = await getUserData(userId, collectionName);
      
      if (!existing.data) return { modifiedCount: 0 };
      
      const existingData = Array.isArray(existing.data) ? existing.data : [existing.data];
      const index = existingData.findIndex(item => {
        // Match all properties in filter
        for (const key in filter) {
          if (key === 'userId') continue;
          if (item[key] !== filter[key]) return false;
        }
        return true;
      });
      
      if (index === -1) return { modifiedCount: 0 };
      
      // Apply updates
      if (update.$set) {
        existingData[index] = { ...existingData[index], ...update.$set };
      }
      
      await saveUserData(userId, collectionName, existingData);
      return { modifiedCount: 1 };
    },
    deleteOne: async (filter: any) => {
      const userId = filter.userId || 'default';
      const existing = await getUserData(userId, collectionName);
      
      if (!existing.data) return { deletedCount: 0 };
      
      const existingData = Array.isArray(existing.data) ? existing.data : [existing.data];
      const filteredData = existingData.filter(item => {
        // Exclude items that match all properties in filter
        for (const key in filter) {
          if (key === 'userId') continue;
          if (item[key] === filter[key]) return false;
        }
        return true;
      });
      
      // If no items were filtered out, nothing was deleted
      if (filteredData.length === existingData.length) {
        return { deletedCount: 0 };
      }
      
      await saveUserData(userId, collectionName, filteredData);
      return { deletedCount: existingData.length - filteredData.length };
    }
  };
};

// PostgreSQL connection has been completely removed as requested.
// The app will now use Firebase Firestore exclusively.

const pool = {
  query: async () => {
    throw new Error("PostgreSQL is disconnected! This API route needs to be migrated to Firebase Firestore.");
  }
};

export default pool;
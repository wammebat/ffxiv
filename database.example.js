/**
 * Example: Database Access Module with Secure Credentials
 * 
 * This example shows how to integrate the config.local.js credentials
 * into your application. This snippet can be added to app.js or placed
 * in a separate module (e.g., database.js).
 * 
 * IMPORTANT: This is for REFERENCE only. Adapt based on your backend architecture.
 */

// ============================================
// DATABASE ACCESS WITH CREDENTIALS
// ============================================

/**
 * Initialize database connection using credentials from config.local.js
 * 
 * For GitHub Pages (static site), you'll need a backend API.
 * This shows how to configure connection parameters.
 */

class DatabaseService {
  constructor(config) {
    this.config = config;
    this.isConnected = false;
  }

  /**
   * Connect to database (calls backend API)
   */
  async connect() {
    try {
      const response = await fetch('/api/db/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Never send raw credentials to frontend!
          // Instead, use a secure token or session
          sessionToken: await this.getSessionToken()
        })
      });

      if (response.ok) {
        this.isConnected = true;
        console.log('✓ Database connection established');
        return true;
      } else {
        console.error('✗ Failed to connect to database');
        return false;
      }
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }

  /**
   * Execute a database query through backend API
   */
  async query(sqlQuery, params = []) {
    if (!this.isConnected) {
      console.error('Not connected to database');
      return null;
    }

    try {
      const response = await fetch('/api/db/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: sqlQuery,
          params: params,
          sessionToken: await this.getSessionToken()
        })
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Query failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Query error:', error);
      return null;
    }
  }

  /**
   * Get or refresh session token for secure API requests
   */
  async getSessionToken() {
    // This would come from your authentication system
    return localStorage.getItem('sessionToken') || null;
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    try {
      await fetch('/api/db/disconnect', {
        method: 'POST'
      });
      this.isConnected = false;
      console.log('✓ Database connection closed');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }
}

// ============================================
// USAGE EXAMPLE
// ============================================

/**
 * Example: Fetch relics from database
 */
async function fetchRelicsFromDatabase() {
  const db = new DatabaseService(CONFIG.database);
  
  // Connect to database
  const connected = await db.connect();
  if (!connected) {
    console.error('Could not connect to database');
    return [];
  }

  try {
    // Execute query to fetch all relics
    const result = await db.query(
      'SELECT * FROM relics WHERE status = $1 ORDER BY dateCollected DESC',
      ['collected']
    );

    if (result && result.data) {
      console.log(`Loaded ${result.data.length} relics from database`);
      return result.data;
    }
  } finally {
    // Always disconnect when done
    await db.disconnect();
  }

  return [];
}

/**
 * Example: Save relic to database
 */
async function saveRelicToDatabase(relicData) {
  const db = new DatabaseService(CONFIG.database);
  
  if (!await db.connect()) {
    console.error('Could not connect to database');
    return false;
  }

  try {
    const result = await db.query(
      `INSERT INTO relics (name, job, stage, expansionId, dateCollected, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        relicData.name,
        relicData.job,
        relicData.stage,
        relicData.expansionId,
        relicData.dateCollected,
        relicData.notes
      ]
    );

    if (result && result.data) {
      console.log(`✓ Relic saved with ID: ${result.data[0].id}`);
      return true;
    }
  } catch (error) {
    console.error('Error saving relic:', error);
  } finally {
    await db.disconnect();
  }

  return false;
}

// ============================================
// INTEGRATION WITH EXISTING APP STATE
// ============================================

/**
 * Initialize app with database data
 * Call this when your app starts up
 */
async function initializeAppWithDatabase() {
  console.log('🔄 Loading data from database...');
  
  // Validate that config is loaded
  if (typeof CONFIG === 'undefined') {
    console.error('⚠️  Configuration not loaded. Ensure config.local.js is included in your HTML.');
    return false;
  }

  try {
    // Fetch relics from database
    const relicsFromDb = await fetchRelicsFromDatabase();
    
    if (relicsFromDb.length > 0) {
      // Update AppState with database relics
      AppState.relics = relicsFromDb;
      console.log('✓ App initialized with database relics');
      return true;
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }

  return false;
}

// ============================================
// SECURITY NOTES
// ============================================

/**
 * IMPORTANT SECURITY CONSIDERATIONS:
 * 
 * 1. CREDENTIALS IN FRONTEND:
 *    - NEVER expose database credentials in frontend code
 *    - This example assumes a backend API that validates credentials
 *    - Frontend should communicate through secure API endpoints
 * 
 * 2. ENVIRONMENT VARIABLES:
 *    - Use config.local.js ONLY for local development
 *    - For production, use environment variables or secret management
 *    - Set process.env variables on your hosting platform
 * 
 * 3. API AUTHENTICATION:
 *    - Implement proper authentication (JWT, API keys, etc.)
 *    - Always validate requests on the backend
 *    - Use HTTPS for all data transmission
 * 
 * 4. GITHUB PAGES LIMITATION:
 *    - GitHub Pages is static-only, cannot host backend
 *    - You'll need a separate backend service for database access
 *    - Consider: Firebase, Heroku, AWS, Vercel, or custom server
 */

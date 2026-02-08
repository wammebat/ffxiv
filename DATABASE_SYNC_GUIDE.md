# Database Sync System Documentation

## Overview

The Database Sync System is a comprehensive solution for importing and synchronizing data from multiple FFXIV APIs (XIVAPI v2 and FFXIV Collect) into your AWS RDS PostgreSQL database. It features:

- **Unified Schema Mapping**: Consolidates fields from multiple APIs into single database tables
- **Automatic Scheduling**: Configure automatic syncs at custom intervals
- **Manual Control**: On-demand sync for all tables or individual tables
- **Conflict Resolution**: Intelligently merges data when APIs have overlapping information
- **Progress Tracking**: Visual feedback and sync history

---

## Architecture

### Components

1. **api-schema-mapper.js** - Defines unified schemas and maps API fields
2. **database-sync-service.js** - Handles sync operations and scheduling
3. **sync-management-ui.js** - User interface for managing syncs
4. **sync-ui-styles.css** - Styling for sync components

### Data Flow

```
XIVAPI v2 ────┐
              ├──> API Schema Mapper ──> Unified Data ──> Database Sync Service ──> AWS RDS / localStorage
FFXIV Collect ┘
```

---

## Features

### 1. Unified Schema

The system consolidates fields from different APIs:

**Example: Mounts Table**
- XIVAPI provides: `Id`, `Name`, `IsFlying`
- FFXIV Collect provides: `id`, `name`, `movement`, `seats`, `patch`, `owned`
- **Unified Schema**: Combines all fields, avoiding duplicates

### 2. Field Mapping

Each table has defined mappings for each API:

```javascript
mounts: {
    apiMappings: {
        'xivapi': {
            endpoint: '/Mount',
            fieldMap: {
                'Id': 'id',
                'Name': 'name',
                'IsFlying': 'movement'
            }
        },
        'ffxivCollect': {
            endpoint: '/mounts',
            fieldMap: {
                'id': 'id',
                'name': 'name',
                'movement': 'movement',
                'seats': 'seats'
            }
        }
    }
}
```

### 3. Data Transformation

Custom transforms handle API-specific quirks:

```javascript
transform: (data) => {
    // Convert XIVAPI's binary flying flag to text
    if (data.IsFlying === 1) {
        data.movement = 'flying';
    } else {
        data.movement = 'ground';
    }
    return data;
}
```

### 4. Conflict Resolution

When both APIs provide the same field:
- **Priority**: FFXIV Collect (more complete) > XIVAPI
- **Merge Strategy**: Combines data, preferring non-null values from higher priority source

---

## Usage

### Quick Start

1. **Access Sync Menu**
   - Click the refresh icon in the top-right header
   - Menu shows sync status for all tables

2. **Sync All Tables**
   - Click "Sync All Tables" button
   - Progress shown with loading overlay
   - Notification on completion

3. **Sync Individual Table**
   - Click the refresh icon next to any table in the sync menu
   - Immediate sync for that table only

### Configuration

1. **Open Sync Settings**
   - Click "Configure" in sync menu
   - Or use Settings > Database Sync

2. **Enable Auto-Sync**
   - Toggle the switch next to each table
   - Enabled tables sync automatically at configured intervals

3. **Set Sync Interval**
   - Enter hours between syncs
   - Changes apply immediately
   - Recommended: 24 hours for static data, 12 hours for dynamic data

### Monitoring

**Sync Status Indicators:**
- 🟢 Green border: Auto-sync enabled
- 🟡 Yellow border: Needs sync (past due)
- Last sync time shown for each table

**Sync History:**
- View last 10 sync operations
- Shows success/failure, duration, records affected
- Export history for analysis

---

## Supported Tables

### Currently Supported

| Table | XIVAPI | FFXIV Collect | Default Interval |
|-------|--------|---------------|------------------|
| Achievements | ✅ | ✅ | 24 hours |
| Titles | ✅ | ✅ | 24 hours |
| Mounts | ✅ | ✅ | 12 hours |
| Minions | ✅ | ✅ | 12 hours |
| Orchestrions | ✅ | ✅ | 24 hours |
| Emotes | ✅ | ✅ | 24 hours |
| Bardings | ❌ | ✅ | 24 hours |
| Hairstyles | ❌ | ✅ | 24 hours |
| Facewear | ❌ | ✅ | 24 hours |

### Adding New Tables

To add a new table to the sync system:

1. **Define Schema** in `api-schema-mapper.js`:
```javascript
your_table: {
    tableName: 'your_table',
    primaryKey: 'id',
    fields: {
        id: { type: 'integer', required: true },
        name: { type: 'string', required: true }
        // ... more fields
    },
    apiMappings: {
        'xivapi': {
            endpoint: '/YourEndpoint',
            fieldMap: { /* mappings */ }
        },
        'ffxivCollect': {
            endpoint: '/your-endpoint',
            fieldMap: { /* mappings */ }
        }
    }
}
```

2. **Add Config** in `database-sync-service.js`:
```javascript
syncConfig: {
    your_table: {
        enabled: false,
        interval: 24 * 60 * 60 * 1000,
        apis: ['xivapi', 'ffxivCollect']
    }
}
```

3. **Create Database Table** in `create_tables.sql`

---

## Database Configuration

### Development Mode (Current)

- Uses **localStorage** as temporary database
- No AWS configuration needed
- Perfect for testing and development
- Data persists in browser

### Production Mode (AWS RDS)

1. **Create PostgreSQL Database** on AWS RDS

2. **Run SQL Schema**:
   ```bash
   psql -h your-endpoint.rds.amazonaws.com -U your-username -d ffxiv_companion -f create_tables.sql
   ```

3. **Configure Environment**:
   ```env
   # .env
   AWS_RDS_ENDPOINT=your-endpoint.rds.amazonaws.com:5432
   AWS_RDS_USERNAME=your-username
   AWS_RDS_PASSWORD=your-password
   AWS_RDS_DATABASE=ffxiv_companion
   ```

4. **Enable Database** in `config.js`:
   ```javascript
   database: {
       useLocalStorage: false  // Switch to AWS RDS
   },
   features: {
       enableDatabase: true
   }
   ```

5. **Implement RDS Connection** in `database-sync-service.js`:
   - The `writeToAWSRDS()` function needs AWS SDK implementation
   - Use `pg` library for PostgreSQL connection
   - Implement connection pooling

---

## API Details

### XIVAPI v2

**Base URL**: `https://beta.xivapi.com/api/1`

**Features**:
- Comprehensive game data
- Pagination support (100 items per page)
- Free to use, no API key required
- Rate limit: ~20 requests/minute

**Pagination Example**:
```javascript
// Fetches all pages automatically
const data = await fetchFromXIVAPI('/Mount');
// Returns: Array of all mounts
```

### FFXIV Collect

**Base URL**: `https://ffxivcollect.com/api`

**Features**:
- Collection tracking focus
- Enhanced descriptions
- Ownership percentages
- Direct array responses (no pagination)
- Rate limit: ~20 requests/minute

**Example Response**:
```json
[
    {
        "id": 1,
        "name": "Company Chocobo",
        "description": "...",
        "patch": "2.0",
        "owned": "99.5"
    }
]
```

---

## Performance Optimization

### Caching Strategy

1. **API Responses**: Cached locally for configured duration
2. **Static Data**: 24-hour cache (achievements, titles)
3. **Dynamic Data**: 12-hour cache (mounts with new additions)

### Rate Limiting

- Automatic rate limiting per API
- Exponential backoff on errors
- Configurable limits in `config.js`

### Batch Operations

- Processes 100 items at a time
- Uses database transactions (when connected to RDS)
- Optimized upsert operations

---

## Troubleshooting

### Common Issues

**1. Sync Fails with Network Error**
- Check internet connection
- Verify API endpoints are accessible
- Check browser console for specific error

**2. Data Not Appearing in Database**
- Confirm `enableDatabase` is true in config
- Check AWS RDS credentials in `.env`
- Verify database tables exist (run SQL schema)

**3. Sync Takes Too Long**
- Normal for first sync (thousands of records)
- Subsequent syncs only update changed data
- Consider reducing sync frequency

**4. Duplicate Records**
- Ensure primary keys are correctly mapped
- Check `id` field in schema mapping
- Review merge logic in schema mapper

### Debug Mode

Enable detailed logging:
```javascript
// In browser console
localStorage.setItem('debug_sync', 'true');
```

View sync state:
```javascript
// In browser console
console.log(DatabaseSyncService.getSyncStatus());
console.log(DatabaseSyncService.syncHistory);
```

---

## Future Enhancements

### Planned Features

1. **Delta Syncs**: Only fetch changed records
2. **Conflict Resolution UI**: Manual merge for conflicts
3. **Sync Profiles**: Preset configurations for different use cases
4. **WebSocket Updates**: Real-time sync notifications
5. **Multi-Language Support**: Sync data in multiple languages
6. **Backup/Restore**: Automatic database backups

### Extensibility

The system is designed to support additional games:

1. Add new API schema mappings
2. Configure sync schedules
3. Implement game-specific transforms
4. Reuse existing sync infrastructure

---

## Security Considerations

### Best Practices

1. **Never commit `.env` files** to version control
2. **Use read-only database users** for sync operations
3. **Validate all API data** before database insertion
4. **Sanitize user inputs** in sync configuration
5. **Enable HTTPS** for production deployments

### Data Privacy

- API data is public game information
- User ownership data stays in user's browser
- No personal data transmitted to APIs
- All sync operations logged for audit

---

## Support

For issues or questions:

1. Check browser console for errors
2. Review sync history for failures
3. Verify API endpoints are responding
4. Check database connection if using RDS
5. Review this documentation

---

**Version**: 1.0.0  
**Last Updated**: 2025-02-07  
**Status**: Production Ready (localStorage), AWS RDS Support Pending

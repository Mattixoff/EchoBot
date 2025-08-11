const { MongoClient } = require('mongodb');
const config = require('../config.js');
const logger = require('./logger.js');

class DatabaseManager {
    constructor() {
        this.client = null;
        this.db = null;
        this.isConnected = false;
    }

    // Database connection
    async connect() {
        if (!config.database.enabled) {
            logger.warn('Database disabled in configuration');
            return false;
        }

        try {
            logger.info('🔌 Connecting to MongoDB database...');
            
            this.client = new MongoClient(config.database.url, config.database.options);
            await this.client.connect();
            
            this.db = this.client.db();
            this.isConnected = true;
            
            logger.success('Successfully connected to MongoDB database');
            
            // Test connection
            await this.db.admin().ping();
            logger.info('🏓 Database ping successful');
            
            return true;
            
        } catch (error) {
            logger.error(`Error connecting to database: ${error.message}`);
            this.isConnected = false;
            return false;
        }
    }

    // Database disconnection
    async disconnect() {
        if (this.client) {
            try {
                await this.client.close();
                this.isConnected = false;
                logger.info('🔌 Disconnected from MongoDB database');
            } catch (error) {
                logger.error(`Error during disconnection: ${error.message}`);
            }
        }
    }

    // Get a collection
    getCollection(collectionName) {
        if (!this.isConnected || !this.db) {
            throw new Error('Database not connected');
        }
        return this.db.collection(collectionName);
    }

    // CRUD operations for users
    async createUser(userData) {
        try {
            const collection = this.getCollection(config.database.collections.users);
            const result = await collection.insertOne(userData);
            logger.debug(`User created: ${userData.userId}`);
            return result;
        } catch (error) {
            logger.error(`Error creating user: ${error.message}`);
            throw error;
        }
    }

    async getUser(userId) {
        try {
            const collection = this.getCollection(config.database.collections.users);
            return await collection.findOne({ userId: userId });
        } catch (error) {
            logger.error(`Error retrieving user: ${error.message}`);
            throw error;
        }
    }

    async updateUser(userId, updateData) {
        try {
            const collection = this.getCollection(config.database.collections.users);
            const result = await collection.updateOne(
                { userId: userId },
                { $set: updateData },
                { upsert: true }
            );
            logger.debug(`User updated: ${userId}`);
            return result;
        } catch (error) {
            logger.error(`Error updating user: ${error.message}`);
            throw error;
        }
    }

    // Operations for servers
    async createGuild(guildData) {
        try {
            const collection = this.getCollection(config.database.collections.guilds);
            const result = await collection.insertOne(guildData);
            logger.debug(`Guild created: ${guildData.guildId}`);
            return result;
        } catch (error) {
            logger.error(`Error creating guild: ${error.message}`);
            throw error;
        }
    }

    async getGuild(guildId) {
        try {
            const collection = this.getCollection(config.database.collections.guilds);
            return await collection.findOne({ guildId: guildId });
        } catch (error) {
            logger.error(`Error retrieving guild: ${error.message}`);
            throw error;
        }
    }

    async updateGuild(guildId, updateData) {
        try {
            const collection = this.getCollection(config.database.collections.guilds);
            const result = await collection.updateOne(
                { guildId: guildId },
                { $set: updateData },
                { upsert: true }
            );
            logger.debug(`Guild updated: ${guildId}`);
            return result;
        } catch (error) {
            logger.error(`Error updating guild: ${error.message}`);
            throw error;
        }
    }

    // Operations for warnings
    async addWarning(warningData) {
        try {
            const collection = this.getCollection(config.database.collections.warnings);
            const result = await collection.insertOne({
                ...warningData,
                createdAt: new Date()
            });
            logger.debug(`Warning added for: ${warningData.userId}`);
            return result;
        } catch (error) {
            logger.error(`Error adding warning: ${error.message}`);
            throw error;
        }
    }

    async getWarnings(userId, guildId) {
        try {
            const collection = this.getCollection(config.database.collections.warnings);
            return await collection.find({ 
                userId: userId, 
                guildId: guildId 
            }).toArray();
        } catch (error) {
            logger.error(`Error retrieving warnings: ${error.message}`);
            throw error;
        }
    }

    // Operations for levels
    async updateUserLevel(userId, guildId, xp, level) {
        try {
            const collection = this.getCollection(config.database.collections.levels);
            const result = await collection.updateOne(
                { userId: userId, guildId: guildId },
                { 
                    $set: { 
                        xp: xp, 
                        level: level, 
                        lastUpdated: new Date() 
                    } 
                },
                { upsert: true }
            );
            logger.debug(`Level updated for: ${userId}`);
            return result;
        } catch (error) {
            logger.error(`Error updating level: ${error.message}`);
            throw error;
        }
    }

    async getUserLevel(userId, guildId) {
        try {
            const collection = this.getCollection(config.database.collections.levels);
            return await collection.findOne({ userId: userId, guildId: guildId });
        } catch (error) {
            logger.error(`Error retrieving level: ${error.message}`);
            throw error;
        }
    }

    // Operations for logs
    async addLog(logData) {
        try {
            const collection = this.getCollection(config.database.collections.logs);
            const result = await collection.insertOne({
                ...logData,
                timestamp: new Date()
            });
            logger.debug(`Log added: ${logData.type}`);
            return result;
        } catch (error) {
            logger.error(`Error adding log: ${error.message}`);
            throw error;
        }
    }

    // Database statistics
    async getStats() {
        try {
            const stats = {};
            
            for (const [name, collectionName] of Object.entries(config.database.collections)) {
                const collection = this.getCollection(collectionName);
                stats[name] = await collection.countDocuments();
            }
            
            return stats;
        } catch (error) {
            logger.error(`Error retrieving statistics: ${error.message}`);
            throw error;
        }
    }

    // Test connection
    async ping() {
        try {
            if (!this.isConnected || !this.db) {
                return false;
            }
            await this.db.admin().ping();
            return true;
        } catch (error) {
            logger.error(`Error pinging database: ${error.message}`);
            return false;
        }
    }

    // Connection status
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            database: this.db ? this.db.databaseName : null,
            collections: config.database.collections
        };
    }

    // Methods for system configurations
    async getVerificationConfig(guildId) {
        try {
            const collection = this.getCollection('guilds');
            const guildConfig = await collection.findOne({ guildId: guildId });
            return guildConfig?.verification || null;
        } catch (error) {
            logger.error(`Error retrieving verification configuration: ${error.message}`);
            return null;
        }
    }

    async saveVerificationConfig(guildId, config) {
        try {
            const collection = this.getCollection('guilds');
            await collection.updateOne(
                { guildId: guildId },
                { 
                    $set: { 
                        guildId: guildId,
                        verification: config,
                        updatedAt: new Date()
                    }
                },
                { upsert: true }
            );
            logger.info(`✅ Verification configuration saved for guild ${guildId}`);
            return true;
        } catch (error) {
            logger.error(`Error saving verification configuration: ${error.message}`);
            return false;
        }
    }

    async updateVerificationConfig(guildId, updates) {
        try {
            const collection = this.getCollection('guilds');
            const updateData = {};
            
            // Build update object
            Object.keys(updates).forEach(key => {
                updateData[`verification.${key}`] = updates[key];
            });
            
            updateData['updatedAt'] = new Date();
            
            await collection.updateOne(
                { guildId: guildId },
                { $set: updateData },
                { upsert: true }
            );
            
            logger.info(`✅ Verification configuration updated for guild ${guildId}`);
            return true;
        } catch (error) {
            logger.error(`Error updating verification configuration: ${error.message}`);
            return false;
        }
    }
}

module.exports = new DatabaseManager();

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const logger = require('../utils/logger.js');

class EventHandler {
    constructor(client) {
        this.client = client;
        this.events = new Collection();
        this.eventCategories = new Collection();
    }

    // Load all events from subfolders
    async loadEvents() {
        const eventsPath = path.join(__dirname, '../events');
        
        try {
            // Check if events folder exists
            if (!fs.existsSync(eventsPath)) {
                logger.warn('Events folder not found, creating...');
                fs.mkdirSync(eventsPath, { recursive: true });
                return;
            }

            // Read subfolders
            const categories = fs.readdirSync(eventsPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            logger.info(`Found ${categories.length} event categories: ${categories.join(', ')}`);

            let totalEvents = 0;
            let loadedEvents = 0;

            // Load events from each category
            for (const category of categories) {
                const categoryPath = path.join(eventsPath, category);
                const eventFiles = fs.readdirSync(categoryPath)
                    .filter(file => file.endsWith('.js'));

                logger.debug(`Loading category '${category}' with ${eventFiles.length} events`);

                for (const file of eventFiles) {
                    totalEvents++;
                    try {
                        const filePath = path.join(categoryPath, file);
                        const event = require(filePath);

                        // Verify event has required properties
                        if (this.validateEvent(event, file)) {
                            event.category = category;
                            event.file = file;
                            event.enabled = event.enabled !== false; // Enable by default

                            this.events.set(event.name, event);
                            
                            // Group by category
                            if (!this.eventCategories.has(category)) {
                                this.eventCategories.set(category, new Collection());
                            }
                            this.eventCategories.get(category).set(event.name, event);
                            
                            loadedEvents++;
                            logger.debug(`Event '${event.name}' loaded from category '${category}'`);
                        } else {
                            logger.warn(`Event '${file}' is invalid, skipped`);
                        }
                    } catch (error) {
                        logger.error(`Error loading event '${file}': ${error.message}`);
                    }
                }
            }

            logger.success(`Events loaded: ${loadedEvents}/${totalEvents}`);
            
            // Log event table
            const eventsArray = Array.from(this.events.values());
            logger.logEvents(eventsArray);

        } catch (error) {
            logger.error(`Error loading events: ${error.message}`);
        }
    }

    // Validate event structure
    validateEvent(event, filename) {
        const requiredProperties = ['name', 'execute'];
        const missingProperties = requiredProperties.filter(prop => !event[prop]);

        if (missingProperties.length > 0) {
            logger.warn(`Event '${filename}' missing properties: ${missingProperties.join(', ')}`);
            return false;
        }

        if (typeof event.execute !== 'function') {
            logger.warn(`Event '${filename}' has invalid execute property`);
            return false;
        }

        return true;
    }

    // Register all loaded events
    async registerEvents() {
        for (const [name, event] of this.events) {
            if (!event.enabled) {
                logger.warn(`Event '${name}' is disabled, not registered`);
                continue;
            }

            try {
                if (event.once) {
                    this.client.once(event.name, (...args) => event.execute(...args));
                } else {
                    this.client.on(event.name, (...args) => event.execute(...args));
                }
                
                logger.debug(`Event '${event.name}' registered successfully`);
            } catch (error) {
                logger.error(`Error registering event '${event.name}': ${error.message}`);
            }
        }

        logger.success('All events have been registered');
    }

    // Get all events
    getAllEvents() {
        return this.events;
    }

    // Get events by specific category
    getEventsByCategory(category) {
        return this.eventCategories.get(category) || new Collection();
    }

    // Get all categories
    getCategories() {
        return this.eventCategories;
    }

    // Enable/disable an event
    toggleEvent(eventName, enabled) {
        const event = this.events.get(eventName);
        if (event) {
            event.enabled = enabled;
            logger.info(`Event '${eventName}' ${enabled ? 'enabled' : 'disabled'}`);
            return true;
        }
        return false;
    }
}

module.exports = EventHandler;

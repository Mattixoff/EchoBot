const config = require('../config.js');

class Logger {
    constructor() {
        this.colors = {
            reset: '\x1b[0m',
            bright: '\x1b[1m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            white: '\x1b[37m'
        };
    }

    // Method to create a table
    createTable(headers, rows) {
        const columnWidths = headers.map(header => header.length);
        
        // Calculate maximum width for each column
        rows.forEach(row => {
            row.forEach((cell, index) => {
                const cellLength = String(cell).length;
                if (cellLength > columnWidths[index]) {
                    columnWidths[index] = cellLength;
                }
            });
        });

        // Create header row
        let table = '\n' + '┌' + '─'.repeat(columnWidths.reduce((a, b) => a + b + 3, 0) - 1) + '┐\n';
        
        // Headers
        table += '│ ' + headers.map((header, index) => 
            header.padEnd(columnWidths[index])
        ).join(' │ ') + ' │\n';
        
        // Separator
        table += '├' + '─'.repeat(columnWidths.reduce((a, b) => a + b + 3, 0) - 1) + '┤\n';
        
        // Data rows
        rows.forEach(row => {
            table += '│ ' + row.map((cell, index) => 
                String(cell).padEnd(columnWidths[index])
            ).join(' │ ') + ' │\n';
        });
        
        // Close table
        table += '└' + '─'.repeat(columnWidths.reduce((a, b) => a + b + 3, 0) - 1) + '┘\n';
        
        return table;
    }

    // Log for loaded commands
    logCommands(commands) {
        if (!config.logging.enabled) return;
        
        const headers = ['Command', 'Category', 'Status', 'Description'];
        const rows = [];
        
        commands.forEach(cmd => {
            const status = cmd.enabled ? '✅ Loaded' : '❌ Disabled';
            rows.push([
                cmd.name || 'N/A',
                cmd.category || 'General',
                status,
                cmd.description || 'No description'
            ]);
        });
        
        console.log(this.colors.cyan + this.colors.bright + '\n📋 LOADED COMMANDS:' + this.colors.reset);
        console.log(this.createTable(headers, rows));
    }

    // Log for loaded events
    logEvents(events) {
        if (!config.logging.enabled) return;
        
        const headers = ['Event', 'Status', 'File'];
        const rows = [];
        
        events.forEach(event => {
            const status = event.enabled ? '✅ Loaded' : '❌ Disabled';
            rows.push([
                event.name || 'N/A',
                status,
                event.file || 'N/A'
            ]);
        });
        
        console.log(this.colors.magenta + this.colors.bright + '\n📡 LOADED EVENTS:' + this.colors.reset);
        console.log(this.createTable(headers, rows));
    }

    // Generic logs
    info(message) {
        if (!config.logging.enabled) return;
        const timestamp = config.logging.showTimestamp ? `[${new Date().toISOString()}] ` : '';
        console.log(this.colors.white + timestamp + 'ℹ️  ' + message + this.colors.reset);
    }

    success(message) {
        if (!config.logging.enabled) return;
        const timestamp = config.logging.showTimestamp ? `[${new Date().toISOString()}] ` : '';
        console.log(this.colors.green + timestamp + '✅ ' + message + this.colors.reset);
    }

    warn(message) {
        if (!config.logging.enabled) return;
        const timestamp = config.logging.showTimestamp ? `[${new Date().toISOString()}] ` : '';
        console.log(this.colors.yellow + timestamp + '⚠️  ' + message + this.colors.reset);
    }

    error(message) {
        if (!config.logging.enabled) return;
        const timestamp = config.logging.showTimestamp ? `[${new Date().toISOString()}] ` : '';
        console.log(this.colors.red + timestamp + '❌ ' + message + this.colors.reset);
    }

    debug(message) {
        if (!config.logging.enabled || config.logging.level !== 'debug') return;
        const timestamp = config.logging.showTimestamp ? `[${new Date().toISOString()}] ` : '';
        console.log(this.colors.cyan + timestamp + '🐛 ' + message + this.colors.reset);
    }
}

module.exports = new Logger();

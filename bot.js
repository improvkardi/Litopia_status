require('dotenv').config(); // Load environment variables from .env file
const { default: axios } = require('axios'); // Import axios for making HTTP requests
const { Client, GatewayIntentBits, ActivityType } = require('discord.js'); // Import required classes from discord.js

// Create a new Discord client instance with specific intents
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Discord bot token stored in the .env file
const myToken = process.env.TOKEN;

// Define server details and status variables
const serverIP = 'play.litopia.fr';
const serverPort = 25565;
let websiteStatus = false;
let serverStatus = false;

function getOnlineStatus(nbPlayer){
    return nbPlayer>0 ? (nbPlayer > 1 ? nbPlayer + ' joueurs' : '1 joueur') : 'En ligne'
}

// Function to check the website status and Minecraft server status, then update bot presence
async function updateBotStatus() {
    try {
        // Check the website status
        console.log('Checking website status...');
        const websiteResponse = await axios.get('https://litopia.fr');
        websiteStatus = websiteResponse.status === 200; // If status is 200, website is online
    } catch (error) {
        console.error(`Error checking website: ${error.message}`);
        websiteStatus = false; // Mark website as offline in case of error
    }

    let nbPlayer = 0;
    try {
        // Check the Minecraft server status
        console.log('Checking Minecraft server status...');
        const serverResponse = await axios.get(`https://api.mcsrvstat.us/3/${serverIP}`);
        serverStatus = serverResponse.data.online; // If server is online
        nbPlayer = serverResponse.data.players ? serverResponse.data.players.online : 0; // Get number of players if available
    } catch (error) {
        console.error(`Error checking server: ${error.message}`);
        serverStatus = false; // Mark server as offline in case of error
    }

    // Update bot's nickname and presence across all guilds (servers)
    try {
        client.guilds.cache.forEach(async guild => {
            const me = guild.members.me; // Get bot's member object in the guild
            if (me) {
                // Update nickname based on server status and number of players

                const nickname = serverStatus ? getOnlineStatus(nbPlayer) : 'Offline';
                await me.setNickname(nickname);
            }
        });

        // Set bot activity (status message)
        const statusMessage = `https://litopia.fr - ${websiteStatus ? 'Online' : 'Offline'}`;
        client.user.setActivity(statusMessage, { type: ActivityType.Custom });
        
        // Set bot's online status: "online" if server is up, "dnd" (do not disturb) if server is down
        client.user.setStatus(serverStatus ? 'online' : 'dnd');
        console.log(`Bot status updated: ${serverStatus ? 'online' : 'dnd'}`);
    } catch (error) {
        console.error(`Error updating bot presence: ${error.message}`);
    }
}

// When the bot is ready, run this once
client.once('ready', () => {
    console.log(`${client.user.tag} is online and ready!`);
    updateBotStatus(); // Immediately check and set the bot status on startup
    // Set an interval to update the bot's nickname and presence every 5 minutes
    setInterval(updateBotStatus, 5 * 60 * 1000); // 5 minutes interval (5 * 60 * 1000 ms)
});

// Log in to Discord using the token from .env
client.login(myToken);


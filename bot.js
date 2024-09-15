require('dotenv').config();
const myToken = process.env.TOKEN;
const { default: axios } = require('axios');
const { Client, GatewayIntentBits, ClientPresence } = require('discord.js');
const { ActivityType } = require('discord.js');
const { status } = require('minecraft-server-util');

// Crée un nouveau client Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const serverIP = 'play.litopia.fr';
const serverPort = 25565;
var websiteStatus = false;
var serverStatus = false;

// Ton token Discord (remplace-le par le tien)

// Fonction pour changer le pseudo du bot
async function changeNickname() {
    try {
        // Sélectionner un pseudo aléatoire dans la liste
        console.log('Check website');
        const requestWebsite = await axios.get('https://litopia.fr')
        websiteStatus = requestWebsite.status === 200 ? true:false;
    } catch (error) {
        console.error(`Erreur lors du check website: ${error}`);
        websiteStatus = false;
    }
    try{
        console.log('Check Server');
        const requestServer = await axios.get('https://api.mcsrvstat.us/3/play.litopia.fr')
        //console.log(requestServer.data);
        serverStatus = requestServer.data.online;
        nbPlayer = requestServer.data.players.online;
        //console.log(nbPlayer);
    } catch (error) {
        console.error(`Erreur lors du check serveur : ${error}`);
        serverStatus = false;
    }

    try{
        // Parcourir chaque serveur (guild) où le bot est présent
        client.guilds.cache.forEach(async guild => {
            const me = guild.members.me;  // Récupère le bot dans le serveur
            if (me) {
                await me.setNickname((serverStatus?(nbPlayer+' joueur(s)'):'Hors Ligne'));  // Change le pseudo du bot                
            }
        });

        // Définir la description (activité) du bot
        let statut = 'https://litopia.fr - '+(websiteStatus?'En':'Hors')+' Ligne'
        client.user.setActivity(statut, { type: ActivityType.Custom });
        client.user.setStatus(serverStatus?'online':'dnd');
        console.log(`Status changé : `+ (serverStatus?'online':'dnd'));

    } catch (error) {
        console.error(`Erreur lors du changement de pseudo: ${error}`);
    }
}

// Quand le bot est prêt
client.once('ready', () => {
    console.log(`${client.user.tag} est connecté et prêt !`);
    changeNickname();
    // Appeler la fonction de changement de pseudo toutes les 60 secondes
    setInterval(changeNickname, 5 * 60 * 1000);  // 60 * 1000 ms = 60 secondes
});

// Lancer le bot
client.login(myToken);

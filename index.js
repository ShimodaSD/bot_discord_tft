const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const Sequelize = require('sequelize');


const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    operatorsAliases: false,
    // SQLite only
    storage: 'database.sqlite',
});

const Tags = sequelize.define('tags', {
    nicklol: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
    },
    ranking: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    mmr: {
        type: Sequelize.INTEGER,
        defaultValue: 1500,
        allowNull: false,
    },
    nickdisc: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
    }
});
const Fila = sequelize.define('fila', {
    f_nicklol: {
        type: Sequelize.STRING,
        unique: true,
    },
    f_mmr: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    f_discnome: {
        type: Sequelize.STRING,
    },
});

client.once('ready', () => {
    Tags.sync();
    Fila.sync({ force: true });
    console.log('To vivo!');
});

client.on('message', async message => {
    if (message.content.startsWith(config.prefix)) {
        const input = message.content.slice(config.prefix.length).split(' ');
        const command = input.shift();
        const commandArgs = input.join(' ');


        if (command === 'criar') {
            const splitArgs = commandArgs.split(' ');
            const tagName = splitArgs.shift();
            try {
                // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
                const tag = await Tags.create({
                    nicklol: tagName,
                    nickdisc: message.author.tag,
                });
                let role = message.guild.roles.get("597140881585471494");
                if(!message.member.roles.has(role)){
                    message.member.addRole(role).catch(console.error);
                }                
                return message.reply(`adicionado a SCREAM'S TFT.`);
            }
            catch (e) {
                if (e.name === 'SequelizeUniqueConstraintError') {
                    console.log(e);
                    return message.reply('Essa nome já existe.');

                }
                console.log(e);
                return message.reply('Deu erro isso ai !');

            }

        } else if (command === 'editar' && message.member.hasPermission('ADMINISTRATOR')) {
            const splitArgs = commandArgs.split(' ');
            const tagName = splitArgs.shift();
            const tagDescription = splitArgs.join(' ');

            // equivalent to: UPDATE tags (descrption) values (?) WHERE name='?';
            const affectedRows = await Tags.update({ description: tagDescription }, { where: { nicklol: tagName } });
            if (affectedRows > 0) {
                return message.reply(`${tagName} foi editado.`);
            }
            return message.reply(`Não foi possível encontrar ${tagName}.`);

        } else if (command === 'info' && message.member.hasPermission('ADMINISTRATOR')) {
            const tagName = commandArgs;

            // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
            const tag = await Tags.findOne({ where: { nicklol: tagName } });
            if (tag) {
                return message.channel.send(`${tagName} foi criado em ${tag.createdAt} e seu MMR é de ${tag.mmr} .`);
            }
            return message.reply(`Não foi possivel encontrar : ${tagName}`);

        } else if (command === 'mostrar' && message.member.hasPermission('ADMINISTRATOR')) {
            const tagList = await Tags.findAll({ attributes: ['nicklol'] });
            const tagString = tagList.map(t => t.nicklol).join(', ') || 'Sem players.';
            return message.channel.send(`Lista de players: ${tagString}`);

        } else if (command === 'remover' && message.member.hasPermission('ADMINISTRATOR')) {
            const tagName = commandArgs;
            // equivalent to: DELETE from tags WHERE name = ?;
            const rowCount = await Tags.destroy({ where: { nicklol: tagName } });
            if (!rowCount) return message.reply('Esse player não existe.');

            return message.reply('Player deletado.');

        } else if (command === 'remover' && !message.member.hasPermission('ADMINISTRATOR')) {
            const tagName = message.author.tag;
            // equivalent to: DELETE from tags WHERE name = ?;
            const rowCount = await Tags.destroy({ where: { nicklol: tagName } });
            if (!rowCount) return message.reply('Não existe esse nick.');
            return message.reply('Player retirado do TFT.');
        }

        else if (command === 'fila' && message.member.hasPermission('SPEAK')) {
            const tagNames = message.author.username;

            // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
            const tag = await Tags.findOne({ where: { nickdisc: tagNames } });
            if (tag) {
                const splitArgs = commandArgs.split(' ');
                const tagName = splitArgs.shift();
                try {
                    // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
                    const fila = await Fila.create({
                        f_nicklol: tag.nicklol,
                        f_mmr: tag.mmr,
                        f_discnome: tag.nickdisc,
                    });
                    //verificarfila();
                    return message.reply(`${fila.f_nicklol} foi adicionado a fila !`);
                }
                catch (e) {
                    if (e.name === 'SequelizeUniqueConstraintError') {
                        return message.reply('Você já está na fila.');
                    }
                    return message.reply('Deu erro na fila !');
                }
            }
        } else if (command === 'sair' && message.member.hasPermission('SPEAK')) {
            const tagName = message.author.tag;
            // equivalent to: DELETE from tags WHERE name = ?;
            const rowCount = await Fila.destroy({ where: { f_discnome: tagName } });
            if (!rowCount) return message.reply('Esse player não está na fila.');
            return message.reply('Retirado da fila.');

        }
    }
})

function verificarfila() {
    const games = tagList.map(t => t.nicklol);
    setInterval(função, 15000);
}

client.login(config.token);
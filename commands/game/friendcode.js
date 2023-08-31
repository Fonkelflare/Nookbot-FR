// eslint-disable-next-line consistent-return
module.exports.run = async (client, message, args, level, Discord) => {
  switch (args[0]) {
    case 'set':
    case 'add': {
      if (args.length === 1) {
        return client.error(message.channel, 'Aucun code n’a été donné !', 'Veuillez fournir votre code ami Switch !');
      }

      let code = args.slice(1).join().replace(/[\D]/g, '');

      if (code.length !== 12) {
        return client.error(message.channel, 'Code invalide !', 'Le code doit comporter 12 chiffres !');
      }

      code = `SW-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
      client.userDB.set(message.author.id, code, 'friendcode');

      const name = client.userDB.get(message.author.id, 'island.profileName');

      const embed = new Discord.MessageEmbed()
        .setAuthor({ name: `${message.member.displayName} Code ami`, iconURL: message.author.displayAvatarURL() })
        .setTitle('Votre code ami a été enregistré avec succès !')
        .setColor('#e4000f')
        .setDescription(`**${code}**${name ? `\nSwitch Profile Name: **${name}**` : ''}`);

      return message.channel.send({ embeds: [embed] });
    }
    case 'del':
    case 'delete':
    case 'remove':
      if (client.userDB.has(message.author.id, 'friendcode')) {
        client.userDB.delete(message.author.id, 'friendcode');
        return client.success(message.channel, 'Supprimé avec succès !', "J'ai bien supprimé votre code d'ami ! Vous pouvez le redéfinir en tapant \`.fc set <code>\` !");
      }
      return client.error(message.channel, 'Pas de code ami à supprimer !', 'Vous ne possédez pas de code ami dans la base de données. Vous pouvez le définir en tapant \`.fc set <code>\` !');
    default: {
      if (args.length === 0) {
        // Return user's friend code if they have one
        const fc = client.userDB.ensure(message.author.id, client.config.userDBDefaults).friendcode;
        if (!fc) {
          return client.error(message.channel, 'Aucun code trouvé !', 'Vous n’avez pas défini de code ami ! Vous pouvez le faire en effectuant \`.fc set <code>\` !');
        }

        const name = client.userDB.get(message.author.id, 'island.profileName');

        const embed = new Discord.MessageEmbed()
          .setAuthor({ name: `${message.member.displayName} Code ami`, iconURL: message.author.displayAvatarURL() })
          .setColor('#e4000f')
          .setDescription(`**${fc}**${name ? `\nSwitch Profile Name: **${name}**` : ''}`);

        return message.channel.send({ embeds: [embed] });
      }

      // Attempt to find a member using the arguments provided
      let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

      if (!member && parseInt(args[0], 10)) {
        try {
          member = await message.guild.members.fetch(args[0]);
        } catch (err) {
          // Don't need to send a message here
        }
      }

      if (member) {
        const fc = client.userDB.ensure(member.user.id, client.config.userDBDefaults).friendcode;
        if (!fc) {
          return client.error(message.channel, 'Aucun code trouvé !', `${member.displayName} n’a pas défini son code d'ami !`);
        }

        const name = client.userDB.get(member.user.id, 'island.profileName');

        const embed = new Discord.MessageEmbed()
          .setAuthor({ name: `${member.displayName} Code ami`, iconURL: member.user.displayAvatarURL() })
          .setColor('#e4000f')
          .setDescription(`**${fc}**${name ? `\nSwitch Profile Name: **${name}**` : ''}`);

        return message.channel.send({ embeds: [embed] });
      }

      return client.error(message.channel, 'Membre inconnu !', 'Il n’a pas été possible de trouver un membre ayant ce nom !');
    }
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['fc'],
  permLevel: 'User',
  blockedChannels: [
    '538938170822230026',
    '494376688877174785',
    '661330633510879274',
    '651611409272274954',
    '494467780293427200',
    '669696796024504341',
    '690093605821480980',
    '699035146153623642',
  ],
};

module.exports.help = {
  name: 'friendcode',
  category: 'game',
  description: 'Gestion du code ami Switch',
  usage: 'friendcode <set|del> <code|@member>',
  details: "<set|del> => Permet de définir un nouveau code d'ami ou de supprimer un code existant.\n<code|@member> => Nécessaire uniquement si vous définissez un nouveau code ou si vous obtenez le code d'un autre membre.",
};

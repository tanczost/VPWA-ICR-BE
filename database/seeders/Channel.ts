import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Channel from 'App/Models/Channel'
import { DateTime } from 'luxon'

export default class ChannelSeeder extends BaseSeeder {
  public async run() {
    await Channel.createMany([
      {
        name: 'General_channel',
        private: false,
        lastActivity: DateTime.now(),
        ownerId: 1,
      },
      {
        name: 'User1_channel',
        private: true,
        lastActivity: DateTime.now(),
        ownerId: 2,
      },
    ])
  }
}

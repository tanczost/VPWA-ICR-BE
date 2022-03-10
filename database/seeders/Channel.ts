import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Channel from 'App/Models/Channel'
import { DateTime } from 'luxon'

export default class ChannelSeeder extends BaseSeeder {
  public async run() {
    await Channel.createMany([
      {
        name: 'channel1',
        private: true,
        lastActivity: DateTime.now(),
      },
      {
        name: 'channel2',
        private: true,
        lastActivity: DateTime.now(),
      },
      {
        name: 'channel3',
        private: false,
        lastActivity: DateTime.now(),
      },
      {
        name: 'channel4',
        private: false,
        lastActivity: DateTime.now(),
      },
    ])
  }
}

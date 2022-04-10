import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { ChannelUser } from 'App/Models/ChannelUser'

export default class ChannelSeeder extends BaseSeeder {
  public async run() {
    await ChannelUser.createMany([
      {
        userId: 3,
        channelId: 1,
        invitedById: 2,
        accepted: true,
      },
      {
        userId: 3,
        channelId: 2,
        invitedById: 2,
        accepted: true,
      },
      {
        userId: 3,
        channelId: 3,
        invitedById: 2,
        accepted: true,
      },
      {
        userId: 3,
        channelId: 4,
        invitedById: 2,
        accepted: true,
      },
      {
        userId: 2,
        channelId: 1,
        invitedById: 1,
        accepted: true,
      },
      {
        userId: 2,
        channelId: 2,
        invitedById: 1,
        accepted: true,
      },
      {
        userId: 2,
        channelId: 3,
        invitedById: 1,
        accepted: true,
      },
      {
        userId: 2,
        channelId: 4,
        invitedById: 1,
        accepted: true,
      },
    ])
  }
}

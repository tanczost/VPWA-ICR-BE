import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Message from 'App/Models/Message'

export default class MessageSeeder extends BaseSeeder {
  public async run() {
    for (let i = 0; i < 1000; i++) {
      await Message.create({
        text: { text: `Message ${i}`, mentions: [] },
        userId: Math.random() < 0.5 ? 2 : 3,
        channelId: 3,
      })
    }
  }
}

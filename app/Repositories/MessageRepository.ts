import Database from '@ioc:Adonis/Lucid/Database'
import type {
  MessageRepositoryContract,
  SerializedMessage,
} from '@ioc:Repositories/MessageRepository'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

export default class MessageRepository implements MessageRepositoryContract {
  public async getMessagesFromChannel(
    channelId: number,
    page?: number
  ): Promise<SerializedMessage[]> {
    const pageNumber = page ?? 1
    const messagesRaw = await Database.from('messages')
      .where({ channel_id: channelId })
      .orderBy('created_at', 'desc')
      .paginate(pageNumber, 20)

    const messages = await Promise.all(
      messagesRaw.all().map(async (message) => {
        const user = await User.findOrFail(message.user_id)
        return {
          id: message.id,
          content: message.content,
          channelId: message.channel_id,
          userId: message.userId,
          createdAt: DateTime.fromISO(new Date(message.created_at).toISOString()).toFormat(
            'yyyy LLL dd'
          ),
          updatedAt: DateTime.fromISO(new Date(message.updated_at).toISOString()).toFormat(
            'yyyy LLL dd'
          ),
          author: {
            id: user.id,
            nickName: user.nickName,
            createdAt: user.createdAt.toFormat('yyyy LLL dd'),
            updatedAt: user.updatedAt.toFormat('yyyy LLL dd'),
          },
        } as SerializedMessage
      })
    )
    return messages.reverse() as SerializedMessage[]
  }

  public async create(
    channelId: number,
    userId: number,
    content: string
  ): Promise<SerializedMessage> {
    const channel = await Channel.findOrFail(channelId)
    const pattern = /\B@[a-z0-9_-]+/gi
    const found: string[] = content.match(pattern) ?? []

    const message = await channel.related('messages').create({
      userId,
      content: {
        text: content,
        mentions: [...found.map((m: string) => m.substring(1))],
      },
    })
    await message.load('author')

    return message.serialize() as SerializedMessage
  }
}

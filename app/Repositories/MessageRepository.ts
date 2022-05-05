import type {
  MessageRepositoryContract,
  SerializedMessage,
} from '@ioc:Repositories/MessageRepository'
import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

export default class MessageRepository implements MessageRepositoryContract {
  public async getMessagesFromChannel(
    channelId: number,
    date?: DateTime
  ): Promise<SerializedMessage[]> {
    const dateFrom = date ?? DateTime.now().toISO()

    const messagesRaw = await Message.query()
      .where({ channel_id: channelId })
      .where('created_at', '<', dateFrom.toString())
      .orderBy('created_at', 'desc')
      .limit(40)

    const messages = await Promise.all(
      messagesRaw.map(async (message) => {
        const user = await User.findOrFail(message.userId)
        return {
          id: message.id,
          content: message.content,
          channelId: message.channelId,
          userId: message.userId,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
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

  public async getNewMeesagesFromChannel(
    channelId: number,
    date: DateTime
  ): Promise<SerializedMessage[]> {
    const dateFrom = date

    const messagesRaw = await Message.query()
      .where({ channel_id: channelId })
      .where('created_at', '>', dateFrom.toString())
      .orderBy('created_at', 'desc')

    const messages = await Promise.all(
      messagesRaw.map(async (message) => {
        const user = await User.findOrFail(message.userId)
        return {
          id: message.id,
          content: message.content,
          channelId: message.channelId,
          userId: message.userId,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
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

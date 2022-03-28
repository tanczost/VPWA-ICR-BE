import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Channel from 'App/Models/Channel'
import Message from 'App/Models/Message'
import User from 'App/Models/User'

export interface NewMessage {
  text: { text: string; mentions: string[] }
  channelId: number
  userId: number
}

export interface MessagesFromChannel {
  channelId: number
  page: number
  userId: number
}

export default class MessagesController {
  public async index({}: HttpContextContract) {}

  public async create(newMessageData: NewMessage, { response }: HttpContextContract) {
    const message = new Message()

    try {
      await message.fill(newMessageData).save()
      return { message: 'Message was successfully created.' }
    } catch (error) {
      console.error(error)
      response.status(400).send({ message: error.detail })
    }
  }

  public async getMessagesFromChannel(
    { channelId, page, userId }: MessagesFromChannel,
    { response }: HttpContextContract
  ) {
    const channel = await Channel.findOrFail(channelId)

    //check if user is in the private channel
    if (channel.private) {
      await channel.load('users')

      if (channel.users.map((user) => user.id).includes(userId)) {
        response.status(403).send('This is a private channel')
      }
    }

    const messagesRaw = await Database.from('messages')
      .where({ channel_id: channelId })
      .paginate(page, 20)

    const messages = await Promise.all(
      messagesRaw.all().map(async (message) => {
        const user = await User.findOrFail(message.user_id)

        return {
          id: message.id,
          text: message.text,
          channelId: message.channel_id,
          user: user,
        }
      })
    )

    return {
      channelId,
      page,
      lastPage: messagesRaw.lastPage,
      messages,
    }
  }

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}

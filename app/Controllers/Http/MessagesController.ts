import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Channel from 'App/Models/Channel'
import { ChannelUser } from 'App/Models/ChannelUser'
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
    try {
      const message = new Message()

      const userChannelState = await ChannelUser.query()
        .where('user_id', newMessageData.userId)
        .where('channel_id', newMessageData.channelId)
        .where('accepted', true)

      if (!userChannelState.length) throw new Error('You are not in this  channel')

      await message.fill(newMessageData).save()
      return { message: 'Message was successfully created.' }
    } catch (error) {
      console.error(error)
      response.status(400).send({ message: error.message })
    }
  }

  public async getMessagesFromChannel(
    { channelId, page, userId }: MessagesFromChannel,
    { response }: HttpContextContract
  ) {
    try {
      //check if user is in the channel
      const userChannelState = await ChannelUser.query()
        .where('user_id', userId)
        .where('channel_id', channelId)
        .where('accepted', true)

      if (!userChannelState.length) throw new Error('You are not in this  channel')

      const messagesRaw = await Database.from('messages')
        .where({ channel_id: channelId })
        .orderBy('created_at')
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
    } catch (error) {
      console.error(error)
      response.status(400).send({ message: error.message })
    }
  }

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}

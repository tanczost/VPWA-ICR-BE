import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import { DateTime } from 'luxon'

interface NewChannel {
  name: string
  private?: boolean
}

export default class ChannelsController {
  public async addUser(channelId: number, userId: number, { response }: HttpContextContract) {
    const channel = await Channel.findOrFail(channelId)

    if (channel.private) {
      response.status(403).send({ message: 'Tanczi doiimplementuj' })
    } else {
      try {
        await channel.related('users').attach([userId])
        response.send({ message: 'User added to channel' })
      } catch (error) {
        console.error(error)
        response.status(404).send({ message: error.detail })
      }
    }
  }

  public async getUsers(channelId: number, { response }: HttpContextContract) {
    const channel = await Channel.findOrFail(channelId)

    if (channel) {
      await channel.load('users')
      return {
        channelId,
        users: channel.users.map((user) => {
          return {
            username: user.nickName,
            state: user.state,
          }
        }),
      }
    } else {
      response.status(404)
    }
  }

  public async index({}: HttpContextContract) {}

  public async create(channelData: NewChannel, { response }: HttpContextContract) {
    const channel = new Channel()

    try {
      console.log(DateTime.now())
      await channel.fill({ ...channelData, lastActivity: DateTime.now() }).save()
      return { message: 'Channel is created' }
    } catch (error) {
      console.error(error)
      response.status(400).send({ message: error.detail })
    }
  }

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}

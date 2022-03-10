import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import { DateTime } from 'luxon'

interface NewChannel {
  name: string
  private?: boolean
}

export default class ChannelsController {
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

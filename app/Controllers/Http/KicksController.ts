import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Kick from 'App/Models/Kick'
import ChannelsController from './ChannelsController'

export default class KicksController {
  public async addKick(channelId: number, userId: number, { auth, response }: HttpContextContract) {
    const kick = new Kick()

    if (auth.user === undefined) {
      throw new Error('Not authorized')
    }

    const isKickerInChannel = await new ChannelsController().isUserinChannel(auth.user?.id, userId)

    console.log(isKickerInChannel)
    if (isKickerInChannel) {
      return response.status(403).send({ message: 'You are not in the channel' })
    }

    await kick.fill({ userId, channelId, kickedById: auth.user?.id }).save()

    const kickCount = await this.countKicks(userId, channelId)

    if (kickCount === 3) {
      await Kick.query().where('user_id', userId).where('channel_id', channelId).delete()
      await new ChannelsController().leave(channelId, userId)
      response.send({ message: `User with id: ${userId} is banned` })
    } else {
      response.send({ message: `User with id: ${userId} get one new kick` })
    }
  }

  public async countKicks(userId: number, channelId: number): Promise<number> {
    const kicks = await Kick.query().where('user_id', userId).where('channel_id', channelId)

    return kicks.length
  }
}

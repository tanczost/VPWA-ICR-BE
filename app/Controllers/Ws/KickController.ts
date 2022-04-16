import { inject } from '@adonisjs/core/build/standalone'
import { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import { ChannelUser } from 'App/Models/ChannelUser'
import Kick from 'App/Models/Kick'
import User from 'App/Models/User'
import ChannelsController from '../Http/ChannelsController'

@inject(['Repositories/MessageRepository'])
export default class KicksController {
  constructor(private messageRepository: MessageRepositoryContract) {}

  public async addKick({ auth, socket, params }: WsContextContract, userNick: string) {
    const kick = new Kick()

    if (auth.user === undefined) {
      throw new Error('Not authorized')
    }
    const user = await User.findByOrFail('nickName', userNick)
    const channelId = params.channelId as number
    await kick.fill({ userId: user.id, channelId, kickedById: auth.user?.id }).save()

    const kickCount = await this.countKicks(user.id, params.channelId)
    const isOwner = await new ChannelsController().isOwnerOfChannel(auth.user?.id, params.channelId)

    if (kickCount === 3 || isOwner) {
      //clear kick counter
      await Kick.query().where('user_id', user.id).where('channel_id', channelId).delete()

      const userChannelState = await ChannelUser.query()
        .where('user_id', user.id)
        .where('channel_id', channelId)
        .where('accepted', true)
        .where('banned', false)
        .firstOrFail()

      // set ban for user
      await userChannelState.merge({ banned: true }).save()

      const content = `${user.nickName} is banned from this channel.`
      const message = await this.messageRepository.create(params.channelId, 1, content)

      //inform everybody in channel that user is banned
      socket.broadcast.emit('leave', message, user.nickName)
      //inform user that he is banned from channel
      socket.to(`user${user.id}`).emit('ban', channelId)
      return message
    } else {
      const content = `${user.nickName} has already ${kickCount} kick(s).`
      const message = await this.messageRepository.create(params.channelId, 1, content)

      //inform everybody in channel that user got kick
      socket.broadcast.emit('message', message)
      return message
    }
  }

  public async countKicks(userId: number, channelId: number): Promise<number> {
    const kicks = await Kick.query().where('user_id', userId).where('channel_id', channelId)

    return kicks.length
  }
}

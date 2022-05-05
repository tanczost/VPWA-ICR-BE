import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import type { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import { inject } from '@adonisjs/core/build/standalone'
import { ChannelUser } from 'App/Models/ChannelUser'
import { DateTime } from 'luxon'
import Message from 'App/Models/Message'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
// inject repository from container to controller constructor
// we do so because we can extract database specific storage to another class
// and also to prevent big controller methods doing everything
// controler method just gets data (validates it) and calls repository
// also we can then test standalone repository without controller
// implementation is bind into container inside providers/AppProvider.ts

interface Invitation {
  channelName: string
  invitedByNickName: string
  id: number
  channelId: number
}
@inject(['Repositories/MessageRepository', 'Repositories/ChannelRepository'])
export default class ChannelController {
  constructor(
    private messageRepository: MessageRepositoryContract,
    private channelRepository: ChannelRepositoryContract
  ) {}

  public async leave(context: WsContextContract) {
    if (context.auth.user === undefined) {
      throw new Error('Bad auth')
    }

    const isOwnerOfChannel = await this.channelRepository.isOwnerOfChannel(
      context.auth.user?.id,
      context.params.channelId
    )

    if (isOwnerOfChannel) {
      this.quit(context)
      return
    }

    this.channelRepository.leave(context.params.channelId, context.auth.user?.id)

    const user = await User.findOrFail(context.auth.user?.id)
    const content = `${user.nickName} leave the channel.`
    const message = await this.messageRepository.create(context.params.channelId, 1, content)
    context.socket.broadcast.emit('leave', message, user.nickName)
    return message
  }

  public async revoke({ auth, socket, params }: WsContextContract, userNick: string) {
    if (auth.user === undefined) {
      throw new Error('Bad auth')
    }

    const isOwnerOfChannel = await this.channelRepository.isOwnerOfChannel(
      auth.user?.id,
      params.channelId
    )

    if (!isOwnerOfChannel) {
      return socket.emit('Only owner can revoke members.')
    }

    const user = await User.findByOrFail('nickName', userNick)
    this.channelRepository.leave(params.channelId, user.id)

    const content = `${user.nickName} leave the channel.`
    const message = await this.messageRepository.create(params.channelId, 1, content)
    socket.broadcast.emit('leave', message, user.nickName)
    socket.to(`user${user.id}`).emit('ban', params.channelId)
    return message
  }

  public async addMember({ socket, auth }: WsContextContract, channelId: number, userNick: string) {
    const channel = await Channel.findOrFail(channelId)
    if (auth.user === undefined) {
      throw new Error('Bad auth')
    }

    const requesterUserId = auth.user?.id

    if (channel.private && requesterUserId !== channel.ownerId) {
      socket.emit('Only owner can add new members.')
    }

    try {
      const user = await User.findByOrFail('nick_name', userNick)
      await channel.related('users').attach([user.id])

      const invitation = await ChannelUser.query()
        .where('user_id', user.id)
        .where('channel_id', channelId)
        .preload('channel')
        .preload('user')
        .first()

      if (!invitation) {
        throw new Error('Could not find invitation')
      }

      await invitation
        .merge({
          invitedById: requesterUserId,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        })
        .save()

      const userRequester = await User.findOrFail(requesterUserId)

      const serializedInvite: Invitation = {
        id: invitation.id,
        channelName: invitation.channel.name,
        invitedByNickName: userRequester.nickName,
        channelId: invitation.channel.id,
      }
      socket.to(`user${user.id}`).emit('invite', serializedInvite)
      socket.emit('Invitation successfully created')
    } catch (error) {
      console.log(error.message)
      socket.emit(error.message)
    }
  }

  public async quit({ auth, socket, params }: WsContextContract) {
    if (!auth.user) {
      return
    }
    const channel = await this.channelRepository.quitChannel(params.channelId, auth.user?.id)
    await Message.query().where('channelId', channel.id).delete()
    channel.delete()
    socket.broadcast.emit('delete', channel.id)
    socket.emit('delete', channel.id)
  }
}

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ChannelRepositoryContract } from '@ioc:Repositories/ChannelRepository'
import Ws from '@ioc:Ruby184/Socket.IO/Ws'
import User from 'App/Models/User'
import MessageRepository from 'App/Repositories/MessageRepository'

export interface NewInvitation {
  inviterId: number
  invitedId: number
  channelId: number
}
export default class ChannelUserController {
  constructor(
    private channelRepository: ChannelRepositoryContract,
    private messageRepository: MessageRepository
  ) {}
  public async acceptInvitation(
    invitationId: number,
    requesterUserId: number,
    { response }: HttpContextContract
  ) {
    try {
      const invitation = await this.channelRepository.acceptInvite(invitationId, requesterUserId)

      response.send({
        id: invitation.channel.id,
        name: invitation.channel.name,
        private: invitation.channel.private,
        ownerUsername: invitation.channel.ownerUser.nickName,
        users: [],
        messages: [],
      })

      const user = await User.findOrFail(requesterUserId)
      const content = `${user.nickName} joined the channel.`
      const message = await this.messageRepository.create(invitation.channel.id, 1, content)

      Ws.io.of(`/channels/${invitation.channel.id}`).emit('message', message)
      Ws.io
        .of(`/channels/${invitation.channel.id}`)
        .emit('addUser', { username: user.nickName, state: 1 }, invitation.channel.id)
    } catch (error) {
      console.error(error)
      response.status(400).send({ message: error.message })
    }
  }

  public async declineInvitation(
    invitationId: number,
    requesterUserId: number,
    { response }: HttpContextContract
  ) {
    try {
      await this.channelRepository.declineInvitation(invitationId, requesterUserId)
      response.send({ message: 'Invitation successfully declined' })
    } catch (error) {
      response.status(400).send({ message: error.message })
      console.error(error.message)
    }
  }

  public async getMyInvitations(userId: number) {
    const myInvitations = await this.channelRepository.loadMyInvitations(userId)

    const result = myInvitations.map((invitation) => {
      return {
        id: invitation.id,
        channelName: invitation.channel.name,
        invitedByNickName: invitation.author.nickName,
        channelId: invitation.channel.id,
      }
    })
    return result
  }
}

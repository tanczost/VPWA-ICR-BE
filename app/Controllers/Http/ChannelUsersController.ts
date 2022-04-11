import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import { ChannelUser } from 'App/Models/ChannelUser'

export interface NewInvitation {
  inviterId: number
  invitedId: number
  channelId: number
}
export default class ChannelUserController {
  public async acceptInvitation(
    invitationId: number,
    requesterUserId: number,
    { response }: HttpContextContract
  ) {
    try {
      const invitation = await ChannelUser.findOrFail(invitationId)

      if (invitation.userId !== requesterUserId)
        throw new Error('You can accept only own invitations')
      if (invitation.accepted) throw new Error('This invitation has already been accepted')

      invitation.merge({ accepted: true }).save()

      invitation.delete()

      response.send({ message: 'Invitation successfully accepted' })
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
    const invitation = await ChannelUser.findOrFail(invitationId)

    try {
      if (invitation.userId !== requesterUserId)
        throw new Error('You can decline only own invitations')
      if (invitation.accepted) throw new Error('This invitation has already been accepted')
    } catch (error) {
      console.error(error)
      response.status(400).send({ message: error.message })
      return
    }

    invitation.delete()

    response.send({ message: 'Invitation successfully declined' })
  }

  public async getMyInvitations(userId: number) {
    const myInvitations = await ChannelUser.query()
      .where('userId', userId)
      .where('accepted', false)
      .preload('channel')
      .preload('author')
      .orderBy('created_at', 'asc')

    const result = myInvitations.map((invitation) => {
      return {
        id: invitation.id,
        channelName: invitation.channel.name,
        invitedByNickName: invitation.author.nickName,
      }
    })
    return result
  }
}

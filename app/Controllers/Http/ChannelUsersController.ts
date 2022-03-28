import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import { ChannelUser } from 'App/Models/ChannelUser'

export interface NewInvitation {
  inviterId: number
  invitedId: number
  channelId: number
}
export default class InvitationsController {
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
      .where('user_id', userId)
      .where('accepted', false)
      .orderBy('created_at', 'asc')

    const result = await Promise.all(
      myInvitations.map(async (invitation: ChannelUser) => {
        const channel = await Channel.findOrFail(invitation.channelId)
        const serializedInvite = {
          ...invitation.serialize(),
          channelName: channel.name,
        }

        return serializedInvite
      })
    )

    return {
      myInvitations: result,
    }
  }
}

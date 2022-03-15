import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Invitation from 'App/Models/Invitation'
import ChannelsController from './ChannelsController'

export interface NewInvitation {
  inviterId: number
  invitedId: number
  channelId: number
}
export default class InvitationsController {
  public async index({}: HttpContextContract) {}

  public async create(invitationData: NewInvitation) {
    const invitation = new Invitation()
    try {
      await invitation.fill(invitationData).save()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  public async acceptInvitation(
    invitationId: number,
    requesterUserId: number,
    { response }: HttpContextContract
  ) {
    try {
      const invitation = await Invitation.findOrFail(invitationId)

      if (invitation.invitedId !== requesterUserId)
        throw new Error('You can accept only own invitations')

      const success = await new ChannelsController().attachUser(
        invitation.channelId,
        invitation.invitedId
      )

      if (!success) throw new Error('User is already in channel')

      invitation.delete()

      response.send({ message: 'Invitation successfully accepted' })
    } catch (error) {
      console.error(error)
      response.status(400).send({ message: error.message })
    }
  }

  public async decilineInvitation(invitationId, { response }: HttpContextContract) {}

  public async getMyInvitations(userId: number) {
    const myInvitations = await Invitation.query()
      .where('invitedId', '=', userId)
      .orderBy('id', 'asc')
      .preload('channel')

    return {
      invitations: myInvitations.map((invitation: Invitation) => {
        // await invitation.load()
        const serializedInvite = {
          ...invitation.serialize(),
          channelName: invitation.channel.name,
        }

        return serializedInvite
      }),
    }
  }

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}

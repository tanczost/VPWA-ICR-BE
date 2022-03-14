import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Invitation from 'App/Models/Invitation'

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
    } catch (error) {
      console.error(error)
    }
  }

  public async acceptInvitation(invitationId: number, { response }: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}

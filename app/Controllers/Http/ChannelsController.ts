import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import { DateTime } from 'luxon'
import InvitationsController, { NewInvitation } from './InvitationsController'

interface NewChannel {
  name: string
  private?: boolean
  ownerId: number
}

export default class ChannelsController {
  // create invitation for user to channel
  public async addUser(
    channelId: number,
    userId: number,
    requesterUserId: number,
    { response }: HttpContextContract
  ) {
    const channel = await Channel.findOrFail(channelId)

    const newInvite: NewInvitation = {
      inviterId: requesterUserId,
      invitedId: userId,
      channelId,
    }

    if (channel.private) {
      if (requesterUserId !== channel.ownerId) {
        return response.status(403).send({ message: 'Only owner can add user to private channel' })
      }
      try {
        await new InvitationsController().create(newInvite)
        response.send({ message: 'Invitation for user is successfully created' })
      } catch (error) {
        console.error(error)
        response.status(404).send({ message: error.detail })
      }
    } else {
      try {
        const success = await new InvitationsController().create(newInvite)

        if (!success) throw new Error('Invitation for user already exists')

        response.send({ message: 'Invitation for user is successfully created' })
      } catch (error) {
        console.error(error)
        response.status(404).send({ message: error.message })
      }
    }
  }

  //adduser  to channel, create row in user_channel
  public async attachUser(channelId: number, userId: number) {
    try {
      const channel = await Channel.findOrFail(channelId)
      await channel.related('users').attach([userId])
      return true
    } catch (error) {
      return false
    }
  }

  //TODO: check ifchannel is private and requester is in channel
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

  public async create(channelData: NewChannel, { response }: HttpContextContract) {
    const channel = new Channel()

    try {
      console.log(DateTime.now())
      await channel.fill({ ...channelData, lastActivity: DateTime.now() }).save()
      await channel.related('users').attach([channelData.ownerId])
      return { message: 'Channel is created' }
    } catch (error) {
      console.error(error)
      response.status(400).send({ message: error.detail })
    }
  }

  //delete a channel
  public async delete(channelId: number, userId: number, { response }: HttpContextContract) {
    const channel = await Channel.findOrFail(channelId)

    if (userId !== channel.ownerId) {
      return response.status(403).send({ message: 'Only owner can add user to private channel' })
    }

    await channel.related('users').detach()
    channel.delete()

    response.status(200).send({ message: 'Channel deleted successfully' })
  }

  public async leave(channelId: number, userId: number, { response }: HttpContextContract) {
    const channel = await Channel.findOrFail(channelId)
    await channel.related('users').detach([userId])

    response.status(200).send({ message: 'You leave channel successfully' })
  }

  //TODO: create kick table
  public async addKick(channelId: number, userId: number, { response }: HttpContextContract) {}
}

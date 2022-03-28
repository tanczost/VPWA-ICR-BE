import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import { ChannelUser } from 'App/Models/ChannelUser'
import { DateTime } from 'luxon'

interface NewChannel {
  name: string
  private?: boolean
  ownerId: number
}

export default class ChannelsController {
  // create invitation for user to channel, and  attach to channel
  public async addUser(
    channelId: number,
    userId: number,
    requesterUserId: number,
    { response }: HttpContextContract
  ) {
    const channel = await Channel.findOrFail(channelId)

    if (channel.private && requesterUserId !== channel.ownerId) {
      return response.status(403).send({ message: 'Only owner can add user to private channel' })
    }

    try {
      await channel.related('users').attach([userId])

      const invitation = await ChannelUser.query()
        .where('user_id', userId)
        .where('channel_id', channelId)
        .first()

      if (!invitation) {
        throw new Error('Could not find invitation')
      }

      invitation
        .merge({
          invitedById: requesterUserId,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        })
        .save()

      response.status(200).send({ message: 'Invitation successfully created' })
    } catch (error) {
      console.log(error.message)
      response.status(400).send({ message: error.message })
    }
  }

  //TODO: check ifchannel is private and requester is in channel
  public async getUsers(channelId: number, { response }: HttpContextContract) {
    const channel = await Channel.findOrFail(channelId)

    if (channel) {
      await channel.load('users')

      const usersRaw = await Promise.all(
        channel.users.map(async (user) => {
          const invitation = await ChannelUser.query()
            .where('user_id', user.id)
            .where('channel_id', channelId)
            .first()

          if (!invitation) {
            throw new Error('Could not find invitation')
          }

          if (!invitation.accepted) {
            return null
          }

          return {
            username: user.nickName,
            state: user.state,
          }
        })
      )

      return {
        channelId,
        users: usersRaw.filter((user) => user !== null),
      }
    } else {
      response.status(404)
    }
  }

  public async create(channelData: NewChannel, { response }: HttpContextContract) {
    const channel = new Channel()

    try {
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
  // public async addKick(channelId: number, userId: number, { response }: HttpContextContract) {}
}

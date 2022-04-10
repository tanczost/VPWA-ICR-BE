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

  public async getUsers(channelId: number, userId: number, { response }: HttpContextContract) {
    const channel = await Channel.findOrFail(channelId)
    try {
      const userChannelState = await ChannelUser.query()
        .where('user_id', userId)
        .where('channel_id', channelId)
        .where('accepted', true)

      if (!userChannelState.length) throw new Error('You are not in this  channel')

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
          }
        })
      )

      return {
        channelId,
        users: usersRaw.filter((user) => user !== null),
      }
    } catch (error) {
      console.error(error)
      response.status(400).send({ message: error.message })
    }
  }

  public async create(channelData: NewChannel, { response }: HttpContextContract) {
    const channel = new Channel()

    try {
      await channel.fill({ ...channelData, lastActivity: DateTime.now() }).save()

      const pivotRow = new ChannelUser()
      pivotRow
        .fill({
          userId: channelData.ownerId,
          channelId: channel.id,
          invitedById: channelData.ownerId,
          accepted: true,
        })
        .save()
      return { message: 'Channel is created', channelId: channel.id }
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

  public async leave(channelId: number, userId: number) {
    const channel = await Channel.findOrFail(channelId)
    await channel.related('users').detach([userId])
  }

  public async isUserinChannel(channelId: number, userId: number): Promise<boolean> {
    const userInChannel = await ChannelUser.query()
      .where('user_id', userId)
      .where('channel_id', channelId)
      .where('accepted', true)

    return !userInChannel
  }

  public async isOwnerOfChannel(userId: number, channelId: number): Promise<boolean> {
    const channel = await Channel.findOrFail(channelId)

    return channel.ownerId === userId
  }

  //TODO: add state to owner
}

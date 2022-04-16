import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Channel from 'App/Models/Channel'
import { ChannelUser } from 'App/Models/ChannelUser'
import { DateTime } from 'luxon'
import ChannelUserController from './ChannelUsersController'

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
  ): Promise<number | void> {
    const channel = await Channel.findOrFail(channelId)

    if (channel.private && requesterUserId !== channel.ownerId) {
      response.status(403).send({ message: 'Only owner can add user to private channel' })
      return
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

      await invitation
        .merge({
          invitedById: requesterUserId,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        })
        .save()

      response.status(200).send({ message: 'Invitation successfully created' })
      return invitation.id
    } catch (error) {
      console.log(error.message)
      response.status(400).send({ message: error.message })
    }
  }

  // get members of the channel
  public async getUsers(channelId: number, userId: number, { response }: HttpContextContract) {
    const channel = await Channel.findOrFail(channelId)
    try {
      const userChannelState = await ChannelUser.query()
        .where('user_id', userId)
        .where('channel_id', channelId)
        .where('accepted', true)
        .where('banned', false)

      if (!userChannelState.length) throw new Error('You are not in this  channel')

      await channel.load('users')

      const usersRaw = await Promise.all(
        channel.users.map(async (user) => {
          const invitation = await ChannelUser.query()
            .where('user_id', user.id)
            .where('channel_id', channelId)
            .where('accepted', true)
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

  // create new channel
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
      if (parseInt(error.code) === 23505) {
        response.status(409)
      } else {
        response.status(400)
      }
      console.error(error)
      response.send({ message: error.detail })
    }
  }

  //delete a channel [handle over socket, broadcast to everyone in channel that channel is deleted]
  public async delete(channelId: number, userId: number, { response }: HttpContextContract) {
    const channel = await Channel.findOrFail(channelId)

    if (userId !== channel.ownerId) {
      return response.status(403).send({ message: 'Only owner can delete channel' })
    }

    await channel.related('users').detach()
    channel.delete()

    response.status(200).send({ message: 'Channel deleted successfully' })
  }

  // leave the channel [if userId == ownerId call deleteChannel]
  public async leave(channelId: number, userId: number) {
    const channel = await Channel.findOrFail(channelId)
    await channel.related('users').detach([userId])
  }

  // check if user is in the channel
  public async isUserinChannel(channelId: number, userId: number): Promise<boolean> {
    const userInChannel = await ChannelUser.query()
      .where('user_id', userId)
      .where('channel_id', channelId)
      .where('accepted', true)
      .where('banned', false)

    return !userInChannel
  }

  //check if user is the owner
  public async isOwnerOfChannel(userId: number, channelId: number): Promise<boolean> {
    const channel = await Channel.findOrFail(channelId)

    return channel.ownerId === userId
  }

  // join into public channel without invite
  public async joinInPublicChannel(
    userId: number,
    channelName: string,
    context: HttpContextContract
  ) {
    const channel = await Channel.findByOrFail('name', channelName)
    const inviteId = await this.addUser(channel.id, userId, userId, context)
    if (!inviteId) {
      return
    }
    await new ChannelUserController().acceptInvitation(inviteId, userId, context)
  }
}

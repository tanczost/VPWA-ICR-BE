import { ChannelRepositoryContract, NewChannel } from '@ioc:Repositories/ChannelRepository'
import Channel from 'App/Models/Channel'
import { ChannelUser } from 'App/Models/ChannelUser'
import { DateTime } from 'luxon'

export default class ChannelRepository implements ChannelRepositoryContract {
  public async create(channelData: NewChannel): Promise<Channel> {
    const channel = new Channel()
    await channel.fill({ ...channelData, lastActivity: DateTime.now() }).save()
    return channel
  }

  public async leave(channelId: number, userId: number) {
    const channel = await Channel.findOrFail(channelId)
    await channel.related('users').detach([userId])
  }

  public async quitChannel(channelId: number, userId: number): Promise<Channel> {
    const channel = await Channel.findOrFail(channelId)

    // if user is not the owner, do nothing
    if (userId !== channel.ownerId) {
      throw new Error('Only owner can quit the channel')
    }

    await channel.related('users').detach()

    return channel
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

  public async createInvite(
    channelId: number,
    userId: number,
    requesterUserId: number
  ): Promise<ChannelUser> {
    const channel = await Channel.findOrFail(channelId)

    if (channel.private && requesterUserId !== channel.ownerId) {
      throw new Error('Only owner can invite into private channel')
    }

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

    return invitation
  }

  public async addOwnerIntoChannel(channelData: NewChannel, channelId: number): Promise<void> {
    const pivotRow = new ChannelUser()
    pivotRow
      .fill({
        userId: channelData.ownerId,
        channelId: channelId,
        invitedById: channelData.ownerId,
        accepted: true,
      })
      .save()
  }

  public async getInvite(channelId: number, userId: number): Promise<ChannelUser | null> {
    const invite = await ChannelUser.query()
      .where('user_id', userId)
      .where('channel_id', channelId)
      .where('accepted', true)
      .where('banned', false)
      .first()

    return invite
  }

  public async loadChannelWithUsers(channelId: number): Promise<Channel> {
    const channel = await Channel.findOrFail(channelId)
    await channel.load('users')
    return channel
  }

  public async acceptInvite(invitationId: number, userId: number): Promise<ChannelUser> {
    const invitation = await ChannelUser.findOrFail(invitationId)
    await invitation.load('channel')

    if (invitation.userId !== userId) throw new Error('You can accept only own invitations')
    if (invitation.accepted) throw new Error('This invitation has already been accepted')

    await invitation.merge({ accepted: true }).save()
    await invitation.channel.load('ownerUser')

    return invitation
  }

  public async declineInvitation(invitationId: number, userId: number): Promise<void> {
    const invitation = await ChannelUser.findOrFail(invitationId)

    if (invitation.userId !== userId) throw new Error('You can decline only own invitations')
    if (invitation.accepted) throw new Error('This invitation has already been accepted')

    invitation.delete()
  }

  public async loadMyInvitations(userId: number): Promise<ChannelUser[]> {
    const invitations = await ChannelUser.query()
      .where('userId', userId)
      .where('accepted', false)
      .preload('channel')
      .preload('author')
      .orderBy('created_at', 'asc')

    return invitations
  }
}

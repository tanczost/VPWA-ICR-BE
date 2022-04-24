import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ChannelRepositoryContract, NewChannel } from '@ioc:Repositories/ChannelRepository'
import { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import Channel from 'App/Models/Channel'
import ChannelUserController from './ChannelUsersController'

export default class ChannelsController {
  constructor(
    private channelRepository: ChannelRepositoryContract,
    private messageRepository: MessageRepositoryContract
  ) {}
  // create invitation for user to channel, and  attach to channel
  public async addUser(
    channelId: number,
    userId: number,
    requesterUserId: number,
    { response }: HttpContextContract
  ): Promise<number | void> {
    try {
      const { id } = await this.channelRepository.createInvite(channelId, userId, requesterUserId)

      response.status(200).send({ message: 'Invitation successfully created' })
      return id
    } catch (error) {
      console.log(error.message)
      response.status(400).send({ message: error.message })
    }
  }

  // get members of the channel
  public async getUsers(channelId: number, { response }: HttpContextContract) {
    try {
      const channel = await this.channelRepository.loadChannelWithUsers(channelId)

      const usersRaw = await Promise.all(
        channel.users.map(async (user) => {
          const isUserInChannel = await this.channelRepository.isUserinChannel(channelId, user.id)

          if (!isUserInChannel) {
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
    try {
      const channel = await this.channelRepository.create(channelData)
      await channel.load('ownerUser')

      await this.channelRepository.addOwnerIntoChannel(channelData, channel.id)
      const content = `${channel.ownerUser.nickName} created a new channel.`
      await this.messageRepository.create(channel.id, 1, content)
      return { message: 'Channel is created', channelId: channel.id }
    } catch (error) {
      if (parseInt(error.code) === 23505) {
        //channel with this name already exists
        response.status(409)
      } else {
        response.status(400)
      }
      console.error(error)
      response.send({ message: error.detail })
    }
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
    await new ChannelUserController(this.channelRepository).acceptInvitation(
      inviteId,
      userId,
      context
    )
  }
}

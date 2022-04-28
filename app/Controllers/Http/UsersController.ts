import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ChannelRepository from '@ioc:Repositories/ChannelRepository'
import MessageRepository from '@ioc:Repositories/MessageRepository'
import { UserRepositoryContract } from '@ioc:Repositories/UserRepository'
import ChannelsController from './ChannelsController'
import ChannelUserController from './ChannelUsersController'

interface NewUser {
  nickName: string
  lastName: string
  firstName: string
  email: string
  password: string
}

export default class UsersController {
  constructor(private userRepository: UserRepositoryContract) {}

  public async getMyChannels(userId: number, {}: HttpContextContract) {
    const channels = await this.userRepository.findUsersChannel(userId)

    return {
      userId,
      channels,
    }
  }

  public async create(userData: NewUser, ctx: HttpContextContract) {
    try {
      const newUser = await this.userRepository.create(userData)
      await new ChannelsController(ChannelRepository, MessageRepository).joinInPublicChannel(
        newUser.id,
        'General_channel',
        ctx
      )
      return { message: 'User is saved' }
    } catch (error) {
      console.error(error)
      ctx.response.status(400).send({ message: error.detail })
    }
  }

  public async me({ auth }: HttpContextContract) {
    if (!auth.user) {
      return
    }
    const invitations = await new ChannelUserController(
      ChannelRepository,
      MessageRepository
    ).getMyInvitations(auth.user?.id)
    return { ...auth.user?.serialize(), invitations }
  }
}

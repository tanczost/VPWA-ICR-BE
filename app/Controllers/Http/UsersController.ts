import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { UserRepositoryContract } from '@ioc:Repositories/UserRepository'
import Channel from 'App/Models/Channel'
// import { schema, rules } from '@ioc:Adonis/Core/Validator'
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

  public async create(userData: NewUser, { response }: HttpContextContract) {
    try {
      await this.userRepository.create(userData)
      return { message: 'User is saved' }
    } catch (error) {
      console.error(error)
      response.status(400).send({ message: error.detail })
    }
  }

  public async me({ auth }: HttpContextContract) {
    if (!auth.user) {
      return
    }
    const invitations = await new ChannelUserController().getMyInvitations(auth.user?.id)
    return { ...auth.user?.serialize(), invitations }
  }
}

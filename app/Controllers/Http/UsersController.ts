import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
// import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import ChannelUserController from './ChannelUsersController'

interface NewUser {
  nickName: string
  lastName: string
  firstName: string
  email: string
  password: string
}

export default class UsersController {
  public async getMyChannels(userId: number, {}: HttpContextContract) {
    const user = await User.findOrFail(userId)
    await user.load('channels')

    const channels = await Promise.all(
      user.channels.map(async (channel) => {
        const user = await User.findOrFail(channel.ownerId)

        return {
          id: channel.id,
          name: channel.name,
          private: channel.private,
          ownerUsername: user.nickName,
        }
      })
    )

    await user.load('channels')
    return {
      userId,
      channels,
    }
  }

  public async create(userData: NewUser, { response }: HttpContextContract) {
    const user = new User()

    try {
      await user.fill(userData).save()
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

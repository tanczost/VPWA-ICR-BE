import { NewUser, UserRepositoryContract, UsersChannels } from '@ioc:Repositories/UserRepository'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'

export default class UserRepository implements UserRepositoryContract {
  public async create(userData: NewUser): Promise<void> {
    const user = new User()
    await user.fill(userData).save()
  }

  public async findUsersChannel(userId: number): Promise<UsersChannels[]> {
    const user = await User.findOrFail(userId)
    await user.load('channels')

    const channels = await Promise.all(
      user.channels.map(async (channel: Channel) => {
        await channel.load('ownerUser')
        return {
          id: channel.id,
          name: channel.name,
          private: channel.private,
          ownerUsername: channel.ownerUser.nickName,
        }
      })
    )

    return channels
  }
}

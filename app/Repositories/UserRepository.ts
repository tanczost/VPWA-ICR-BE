import { NewUser, UserRepositoryContract, UsersChannels } from '@ioc:Repositories/UserRepository'
import Channel from 'App/Models/Channel'
import { ChannelUser } from 'App/Models/ChannelUser'
import User from 'App/Models/User'

export default class UserRepository implements UserRepositoryContract {
  public async create(userData: NewUser): Promise<User> {
    const user = new User()
    await user.fill(userData).save()
    return user
  }

  public async findUsersChannel(userId: number): Promise<(UsersChannels | null)[]> {
    const user = await User.findOrFail(userId)
    await user.load('channels')

    const channels = await Promise.all(
      user.channels.map(async (channel: Channel) => {
        const inChannel = await ChannelUser.query()
          .where('user_id', userId)
          .where('channel_id', channel.id)
          .where('accepted', true)
          .where('banned', false)
          .first()

        if (inChannel === null) {
          return null
        }

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

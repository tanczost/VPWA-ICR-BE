import { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import { ChannelUser } from 'App/Models/ChannelUser'

export default class Channel {
  public async wsHandle({ auth, params }: WsContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (!auth.user) {
      throw new Error('Bad auth')
    }

    // check if the user is in the channel
    const res = await ChannelUser.query()
      .where('userId', auth.user?.id)
      .where('channelId', params.channelId)
      .where('banned', false)
      .where('accepted', true)
      .first()

    if (!res) {
      throw new Error('You are not a channel member or you are banned from it.')
    }

    await next()
  }
}

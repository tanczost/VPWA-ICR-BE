import { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import { ChannelUser } from 'App/Models/ChannelUser'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Channel {
  public async handle({ auth, params }: HttpContextContract, next: () => Promise<void>) {
    /**
     * Uses the user defined guards or the default guard mentioned in
     * the config file
     */

    if (!auth.user) {
      throw new Error('Bad auth')
    }

    const channelId = parseInt(params.channelId)
    const channelUserState = ChannelUser.query()
      .where('user_id', auth.user.id)
      .where('channel_id', channelId)
      .where('accepted', true)
      .where('banned', false)
      .first()

    if (channelUserState === null) {
      throw new Error('You are not a channel member or you are banned from it.')
    }

    await next()
  }

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

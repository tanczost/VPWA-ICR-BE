import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import Channel from 'App/Models/Channel'
import User from 'App/Models/User'
import type { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import { inject } from '@adonisjs/core/build/standalone'
// inject repository from container to controller constructor
// we do so because we can extract database specific storage to another class
// and also to prevent big controller methods doing everything
// controler method just gets data (validates it) and calls repository
// also we can then test standalone repository without controller
// implementation is bind into container inside providers/AppProvider.ts
@inject(['Repositories/MessageRepository'])
export default class ChannelController {
  constructor(private messageRepository: MessageRepositoryContract) {}

  public async leave({ params, socket, auth }: WsContextContract) {
    if (auth.user === undefined) {
      throw new Error('Bad auth')
    }
    console.log('hello')
    const channel = await Channel.findOrFail(params.channelId)
    await channel.related('users').detach([auth.user?.id])

    const user = await User.findOrFail(auth.user?.id)
    const content = `${user.nickName} leave tthe channel.`
    const message = await this.messageRepository.create(params.channelId, 1, content)
    // broadcast message to other users in channel
    socket.broadcast.emit('message', message)
    // return message to sender
    return message
  }
}

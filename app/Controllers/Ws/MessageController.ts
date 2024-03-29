import type { WsContextContract } from '@ioc:Ruby184/Socket.IO/WsContext'
import type { MessageRepositoryContract } from '@ioc:Repositories/MessageRepository'
import { inject } from '@adonisjs/core/build/standalone'
import { DateTime } from 'luxon'

// inject repository from container to controller constructor
// we do so because we can extract database specific storage to another class
// and also to prevent big controller methods doing everything
// controler method just gets data (validates it) and calls repository
// also we can then test standalone repository without controller
// implementation is bind into container inside providers/AppProvider.ts
@inject(['Repositories/MessageRepository', 'Repositories/UserRepository'])
export default class MessageController {
  constructor(private messageRepository: MessageRepositoryContract) {}

  public async getMessagesFromChannel({ params }: WsContextContract, date?: DateTime) {
    return this.messageRepository.getMessagesFromChannel(params.channelId, date)
  }

  public async getNewMeesagesFromChannel({ params }: WsContextContract, date: DateTime) {
    return this.messageRepository.getNewMeesagesFromChannel(params.channelId, date)
  }

  public async addMessage({ params, socket, auth }: WsContextContract, content: string) {
    const message = await this.messageRepository.create(params.channelId, auth.user!.id, content)
    // broadcast message to other users in channel
    socket.broadcast.emit('message', message)
    // return message to sender
    return message
  }
}

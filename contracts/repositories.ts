// here we are declaring our MessageRepository types for Repositories/MessageRepository
// container binding. See providers/AppProvider.ts for how we are binding the implementation
declare module '@ioc:Repositories/MessageRepository' {
  export interface SerializedMessage {
    userId: number
    content: {
      text: string
      mentions: string
    }
    channelId: number
    createdAt: string
    updatedAt: string
    id: number
    author: {
      id: number
      nickName: string
      createdAt: string
      updatedAt: string
    }
  }

  export interface MessageRepositoryContract {
    getMessagesFromChannel(channelId: number, page: number): Promise<SerializedMessage[]>
    create(channelId: number, userId: number, content: string): Promise<SerializedMessage>
  }

  const MessageRepository: MessageRepositoryContract
  export default MessageRepository
}

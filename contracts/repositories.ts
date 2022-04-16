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

declare module '@ioc:Repositories/UserRepository' {
  import User from 'App/Models/User'
  export interface NewUser {
    nickName: string
    lastName: string
    firstName: string
    email: string
    password: string
  }

  export interface UsersChannels {
    id: number
    name: string
    private: boolean
    ownerUsername: string
  }
  export interface UserRepositoryContract {
    create(userData: NewUser): Promise<void>
    findUsersChannel(userId: number): Promise<UsersChannels[]>
  }

  const UserRepository: UserRepositoryContract
  export default UserRepository
}

declare module '@ioc:Repositories/ChannelRepository' {
  import Channel from 'App/Models/Channel'
  export interface NewChannel {
    name: string
    private?: boolean
    ownerId: number
  }
  export interface ChannelRepositoryContract {
    create(channelData: NewChannel): Promise<Channel>
    quitChannel(channelId: number, userId: number): Promise<Channel>
    leave(channelId: number, userId: number): Promise<void>
    isUserinChannel(channelId: number, userId: number): Promise<boolean>
    isOwnerOfChannel(userId: number, channelId: number): Promise<boolean>
  }

  const ChannelRepository: ChannelRepositoryContract
  export default ChannelRepository
}

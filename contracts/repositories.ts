// here we are declaring our MessageRepository types for Repositories/MessageRepository

// container binding. See providers/AppProvider.ts for how we are binding the implementation
declare module '@ioc:Repositories/MessageRepository' {
  import { DateTime } from 'luxon'
  export interface SerializedMessage {
    userId: number
    content: {
      text: string
      mentions: string[]
    }
    channelId: number
    createdAt: DateTime
    updatedAt: DateTime
    id: number
    author: {
      id: number
      nickName: string
      createdAt: string
      updatedAt: string
    }
  }

  export interface MessageRepositoryContract {
    getMessagesFromChannel(channelId: number, date?: DateTime): Promise<SerializedMessage[]>
    create(channelId: number, userId: number, content: string): Promise<SerializedMessage>
    getNewMeesagesFromChannel(channelId: number, date: DateTime): Promise<SerializedMessage[]>
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
    create(userData: NewUser): Promise<User>
    findUsersChannel(userId: number): Promise<(UsersChannels | null)[]>
  }

  const UserRepository: UserRepositoryContract
  export default UserRepository
}

declare module '@ioc:Repositories/ChannelRepository' {
  import Channel from 'App/Models/Channel'
  import { ChannelUser } from 'App/Models/ChannelUser'
  export interface NewChannel {
    name: string
    private?: boolean
    ownerId: number
  }
  export interface ChannelRepositoryContract {
    create(channelData: NewChannel): Promise<Channel>
    quitChannel(channelId: number, userId: number): Promise<Channel>
    leave(channelId: number, userId: number): Promise<void>
    addOwnerIntoChannel(channelData: NewChannel, channelId: number): Promise<void>
    isUserinChannel(channelId: number, userId: number): Promise<boolean>
    isOwnerOfChannel(userId: number, channelId: number): Promise<boolean>
    loadChannelWithUsers(channelId: number): Promise<Channel>
    getInvite(channelId: number, userId: number): Promise<ChannelUser | null>
    createInvite(channelId: number, userId: number, requesterUserId: number): Promise<ChannelUser>
    acceptInvite(invitationId: number, userId: number): Promise<ChannelUser>
    declineInvitation(invitationId: number, userId: number): Promise<void>
    loadMyInvitations(userId: number): Promise<ChannelUser[]>
  }

  const ChannelRepository: ChannelRepositoryContract
  export default ChannelRepository
}

/*
|--------------------------------------------------------------------------
| Websocket events
|--------------------------------------------------------------------------
|
| This file is dedicated for defining websocket namespaces and event handlers.
|
*/

import Ws from '@ioc:Ruby184/Socket.IO/Ws'

// this is dynamic namespace, in controller methods we can use params.name
Ws.namespace('channels/:channelId')
  .middleware('channel:api') // check if user can join given channel
  .connected(({ socket, auth }) => {
    const userId = auth.user?.id
    socket.join(`user${userId}`)
  })
  .on('loadMessages', 'MessageController.getMessagesFromChannel')
  .on('loadNewMessages', 'MessageController.getNewMeesagesFromChannel')
  .on('addMessage', 'MessageController.addMessage')
  .on('leave', 'ChannelController.leave')
  .on('kick', 'KickController.addKick')
  .on('revoke', 'ChannelController.revoke')
  .on('quit', 'ChannelController.quit')
  .on('isTyping', ({ socket }, message: string, userNick: string, channelId: number) => {
    if (message === '') {
      socket.broadcast.emit('stopTyping', { userNick, message, channelId })
    } else {
      socket.broadcast.emit('isTyping', { userNick, message, channelId })
    }
  })

Ws.namespace('/notifications')
  .connected(({ socket, auth }) => {
    const userId = auth.user?.id
    socket.join(`user${userId}`)
  })
  .on('addMember', 'ChannelController.addMember')

Ws.namespace('/')
  .connected('ActivityController.onConnected')
  .disconnected('ActivityController.onDisconnected')
  .on('changeStatus', 'ActivityController.changeStatus')

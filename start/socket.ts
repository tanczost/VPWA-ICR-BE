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
  .connected(({ socket, auth }) => {
    const userId = auth.user?.id
    socket.join(`user${userId}`)
  })
  //TODO .middleware('channel') // check if user can join given channel
  .on('loadMessages', 'MessageController.getMessagesFromChannel')
  .on('addMessage', 'MessageController.addMessage')
  .on('leave', 'ChannelController.leave')
  .on('kick', 'KickController.addKick')
  .on('revoke', 'ChannelController.revoke')
  .on('quit', 'ChannelController.quit')

Ws.namespace('/notifications')
  .connected(({ socket, auth }) => {
    const userId = auth.user?.id
    socket.join(`user${userId}`)
  })
  .on('addMember', 'ChannelController.addMember')

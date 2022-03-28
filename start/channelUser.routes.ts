import Route from '@ioc:Adonis/Core/Route'
import ChannelUsersController from 'App/Controllers/Http/ChannelUsersController'

Route.get('/invitations/get-my-invitations/', async (ctx) => {
  try {
    const requesterUserId = ctx.auth.user?.id

    if (!requesterUserId) {
      throw new Error('Invalid user id')
    }

    return new ChannelUsersController().getMyInvitations(requesterUserId)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest()
  }
}).middleware('auth:api')

Route.get('/invitations/:invitationId/accept/', async (ctx) => {
  try {
    const invitationIdttoInt = parseInt(ctx.params.invitationId)

    if (ctx.auth.user?.id === undefined) {
      return ctx.response.status(403).send({ message: 'Authentication failed' })
    }

    return new ChannelUsersController().acceptInvitation(invitationIdttoInt, ctx.auth.user.id, ctx)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest()
  }
}).middleware('auth:api')

Route.get('/invitations/:invitationId/decline/', async (ctx) => {
  try {
    const invitationIdttoInt = parseInt(ctx.params.invitationId)

    if (ctx.auth.user?.id === undefined) {
      return ctx.response.status(403).send({ message: 'Authentication failed' })
    }

    return new ChannelUsersController().declineInvitation(invitationIdttoInt, ctx.auth.user.id, ctx)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest()
  }
}).middleware('auth:api')

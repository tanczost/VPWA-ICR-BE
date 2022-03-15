import Route from '@ioc:Adonis/Core/Route'
import InvitationsController from 'App/Controllers/Http/InvitationsController'

Route.get('/invitations/get-my-invitations/', async (ctx) => {
  try {
    const requesterUserId = ctx.auth.user?.id

    if (!requesterUserId) {
      throw new Error('Invalid user id')
    }

    return new InvitationsController().getMyInvitations(requesterUserId)
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

    return new InvitationsController().acceptInvitation(invitationIdttoInt, ctx.auth.user.id, ctx)
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

    return new InvitationsController().declineInvitation(invitationIdttoInt, ctx.auth.user.id, ctx)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest()
  }
}).middleware('auth:api')

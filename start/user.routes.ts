import Route from '@ioc:Adonis/Core/Route'
import UserRepository from '@ioc:Repositories/UserRepository'
import UserController from '../app/Controllers/Http/UsersController'

Route.get('/me/', async (ctx) => {
  return new UserController(UserRepository).me(ctx)
}).middleware('auth:api')

Route.get('/user/my-channels/', async (ctx) => {
  try {
    if (ctx.auth.user?.id === undefined) {
      return ctx.response.status(403).send({ message: 'Authentication failed' })
    }
    return new UserController(UserRepository).getMyChannels(ctx.auth.user.id, ctx)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest()
  }
}).middleware('auth:api')

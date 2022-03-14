import Route from '@ioc:Adonis/Core/Route'
import UserController from '../app/Controllers/Http/UsersController'

Route.get('/show-user/', async (ctx) => {
  console.log('showuser')
  return new UserController().show(ctx)
}).middleware('auth:api')

Route.get('/user/:userId/my-channels/', async (ctx) => {
  try {
    const userIdtoInt = parseInt(ctx.params.userId)
    return new UserController().getMyChannels(userIdtoInt, ctx)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest()
  }
})

// Route.get('/create-user/', async (ctx) => {
//   return new UserController().create(ctx)
// })

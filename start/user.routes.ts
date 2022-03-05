import Route from '@ioc:Adonis/Core/Route'
import UserController from '../app/Controllers/Http/UsersController'

Route.get('/show-user/', async (ctx) => {
  return new UserController().show(ctx)
}).middleware('auth:api')

Route.get('/create-user/', async (ctx) => {
  return new UserController().create(ctx)
})

import Route from '@ioc:Adonis/Core/Route'
import UserController from '../app/Controllers/Http/UsersController'

Route.get('/kkt/', async (ctx) => {
  return new UserController().create(ctx)
})

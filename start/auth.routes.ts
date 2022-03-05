import Route from '@ioc:Adonis/Core/Route'
import UsersController from 'App/Controllers/Http/UsersController'
import AuthController from '../app/Controllers/Http/AuthController'

Route.post('/login/', async (ctx) => {
  return new AuthController().login(ctx)
})

Route.post('/verify-token/', async (ctx) => {
  return new AuthController().verifyToken(ctx)
})

Route.post('/logout/', async (ctx) => {
  return new AuthController().logout(ctx)
})

Route.post('/registration/', async (ctx) => {
  return new UsersController().create(ctx)
})

import Route from '@ioc:Adonis/Core/Route'
import UsersController from 'App/Controllers/Http/UsersController'
import AuthController from '../app/Controllers/Http/AuthController'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

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
  try {
    const userSchema = schema.create({
      nickName: schema.string({ escape: true, trim: true }, [rules.minLength(6)]),
      firstName: schema.string({ trim: true }, [rules.minLength(3)]),
      lastName: schema.string({ trim: true }, [rules.minLength(3)]),
      email: schema.string({ trim: true }, [rules.email()]),
      password: schema.string({}, [rules.minLength(6)]),
    })
    const payload = await ctx.request.validate({ schema: userSchema })
    return new UsersController().create(payload, ctx)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest()
  }
})

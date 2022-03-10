import Route from '@ioc:Adonis/Core/Route'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import ChannelsController from 'App/Controllers/Http/ChannelsController'

Route.post('/channel/', async (ctx) => {
  try {
    const channelSchema = schema.create({
      name: schema.string({ escape: true, trim: true }, [rules.minLength(3)]),
      private: schema.boolean(),
    })
    const payload = await ctx.request.validate({ schema: channelSchema })
    return new ChannelsController().create(payload, ctx)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest()
  }
  // }).middleware('auth:api')
})

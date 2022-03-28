import Route from '@ioc:Adonis/Core/Route'
import { schema } from '@ioc:Adonis/Core/Validator'
import MessagesController from 'App/Controllers/Http/MessagesController'

// create a new messages
Route.post('/message/', async (ctx) => {
  try {
    const messageSchema = schema.create({
      text: schema.object().members({
        text: schema.string(),
        mentions: schema.array().members(schema.string()),
      }),
      channelId: schema.number(),
    })

    if (ctx.auth.user?.id === undefined) {
      return ctx.response.status(403).send({ message: 'Authentication failed' })
    }

    const payload = {
      ...(await ctx.request.validate({ schema: messageSchema })),
      userId: ctx.auth.user?.id,
    }

    return new MessagesController().create(payload, ctx)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest(error.message)
  }
}).middleware('auth:api')

//get messages from the  channel
Route.get('/message/:channelId/:page/', async (ctx) => {
  try {
    const channelIdtoInt = parseInt(ctx.params.channelId)
    const pageInt = parseInt(ctx.request.param('page', 1))

    if (ctx.auth.user?.id === undefined) {
      return ctx.response.status(403).send({ message: 'Authentication failed' })
    }

    const payload = {
      channelId: channelIdtoInt,
      page: pageInt,
      userId: ctx.auth.user.id,
    }

    return new MessagesController().getMessagesFromChannel(payload, ctx)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest(error.message)
  }
}).middleware('auth:api')

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
Route.get('/channel/:channelId/messages', async (ctx) => {
  try {
    const channelIdtoInt = parseInt(ctx.params.channelId)
    const { page } = ctx.request.qs()
    console.log(page)

    if (ctx.auth.user?.id === undefined) {
      return ctx.response.status(403).send({ message: 'Authentication failed' })
    }

    const payload = {
      channelId: channelIdtoInt,
      page: page === undefined ? 1 : parseInt(page),
      userId: ctx.auth.user.id,
    }

    return new MessagesController().getMessagesFromChannel(payload, ctx)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest(error.message)
  }
}).middleware('auth:api')

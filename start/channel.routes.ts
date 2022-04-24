import Route from '@ioc:Adonis/Core/Route'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import ChannelRepository from '@ioc:Repositories/ChannelRepository'
import MessageRepository from '@ioc:Repositories/MessageRepository'
import ChannelsController from 'App/Controllers/Http/ChannelsController'

// create a new channel
Route.post('/channel/', async (ctx) => {
  try {
    const channelSchema = schema.create({
      name: schema.string({ escape: true, trim: true }, [rules.minLength(3)]),
      private: schema.boolean(),
    })

    if (ctx.auth.user?.id === undefined) {
      return ctx.response.status(403).send({ message: 'Authentication failed' })
    }

    const payload = {
      ...(await ctx.request.validate({ schema: channelSchema })),
      ownerId: ctx.auth.user?.id,
    }

    return new ChannelsController(ChannelRepository, MessageRepository).create(payload, ctx)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest()
  }
}).middleware('auth:api')

// join into public channel
Route.get('/channel/:channelName/join/', async (ctx) => {
  try {
    if (ctx.auth.user?.id === undefined) {
      return ctx.response.status(403).send({ message: 'Authentication failed' })
    }

    return new ChannelsController(ChannelRepository, MessageRepository).joinInPublicChannel(
      ctx.auth.user?.id,
      ctx.params.channelName,
      ctx
    )
  } catch (error) {
    console.log(error)
    ctx.response.badRequest()
  }
}).middleware('auth:api')

// get channel's users
Route.get('/channel/:channelId/users/', async (ctx) => {
  try {
    const requesterUserId = ctx.auth.user?.id

    if (!requesterUserId) {
      throw new Error('Invalid user id')
    }
    const channelIdtoInt = parseInt(ctx.params.channelId)
    return new ChannelsController(ChannelRepository, MessageRepository).getUsers(
      channelIdtoInt,
      ctx
    )
  } catch (error) {
    console.log(error)
    ctx.response.badRequest()
  }
})
  .middleware('auth:api')
  .middleware('channel:api')

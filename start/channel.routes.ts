import Route from '@ioc:Adonis/Core/Route'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import ChannelsController from 'App/Controllers/Http/ChannelsController'
import KicksController from 'App/Controllers/Http/KicksController'

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

    return new ChannelsController().create(payload, ctx)
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
    return new ChannelsController().getUsers(channelIdtoInt, requesterUserId, ctx)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest()
  }
}).middleware('auth:api')

// add user to channel
Route.post('/channel/:channelId/add-user', async (ctx) => {
  try {
    const requesterUserId = ctx.auth.user?.id

    if (!requesterUserId) {
      throw new Error('Invalid user id')
    }

    const channelIdtoInt = parseInt(ctx.params.channelId)
    const addUserSchema = schema.create({
      userId: schema.number([rules.unsigned()]),
    })

    const payload = await ctx.request.validate({ schema: addUserSchema })

    return new ChannelsController().addUser(channelIdtoInt, payload.userId, requesterUserId, ctx)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest()
  }
}).middleware('auth:api')

Route.delete('/channel/:channelId/', async (ctx) => {
  try {
    const channelIdtoInt = parseInt(ctx.params.channelId)

    if (ctx.auth.user?.id === undefined) {
      return ctx.response.status(403).send({ message: 'Authentication failed' })
    }

    return new ChannelsController().delete(channelIdtoInt, ctx.auth.user.id, ctx)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest(error.message)
  }
}).middleware('auth:api')

Route.get('/channel/:channelId/leave/', async (ctx) => {
  try {
    const channelIdtoInt = parseInt(ctx.params.channelId)

    if (ctx.auth.user?.id === undefined) {
      return ctx.response.status(403).send({ message: 'Authentication failed' })
    }

    return new ChannelsController().leave(channelIdtoInt, ctx.auth.user.id)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest()
  }
}).middleware('auth:api')

Route.post('/channel/:channelId/kick/', async (ctx) => {
  try {
    const channelIdtoInt = parseInt(ctx.params.channelId)

    const kickUserSchema = schema.create({
      userId: schema.number([rules.unsigned()]),
    })

    const payload = await ctx.request.validate({ schema: kickUserSchema })

    return new KicksController().addKick(channelIdtoInt, payload.userId, ctx)
  } catch (error) {
    console.log(error)
    ctx.response.badRequest()
  }
}).middleware('auth:api')

// TODO: remove channel after 30d

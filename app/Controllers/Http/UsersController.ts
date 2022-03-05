import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

export default class UsersController {
  public async index({}: HttpContextContract) {}

  public async create({ request }: HttpContextContract) {
    const userSchema = schema.create({
      nickName: schema.string({ escape: true, trim: true }, [rules.minLength(6)]),
      firstName: schema.string({ trim: true }, [rules.minLength(3)]),
      lastName: schema.string({ trim: true }, [rules.minLength(3)]),
      email: schema.string({ trim: true }, [rules.email()]),
      password: schema.string({}, [rules.minLength(6)]),
    })

    const payload = await request.validate({ schema: userSchema })

    const user = new User()

    await user.fill(payload).save()

    return user.$isPersisted ? { message: 'User is saved' } : { message: 'User is not saved' }
  }

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {
    const user = await User.find(1)
    return user?.serialize()
  }

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}

  public async tanczi({}: HttpContextContract) {
    return { hello: 'kkfdt' }
  }
}

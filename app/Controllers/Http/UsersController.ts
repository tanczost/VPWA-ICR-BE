import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
// import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

interface NewUser {
  nickName: string
  lastName: string
  firstName: string
  email: string
  password: string
}

export default class UsersController {
  public async index({}: HttpContextContract) {}

  public async create(userData: NewUser, { response }: HttpContextContract) {
    const user = new User()

    try {
      await user.fill(userData).save()
      return { message: 'User is saved' }
    } catch (error) {
      console.error(error)
      response.status(400).send({ message: error.detail })
    }
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

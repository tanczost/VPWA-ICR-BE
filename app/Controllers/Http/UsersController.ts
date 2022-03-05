import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UsersController {
  public async index({}: HttpContextContract) {}

  public async create({}: HttpContextContract) {
    // const user = new User()
    // await user
    //   .fill({
    //     nickName: 'tanczi',
    //     firstName: 'Tomi',
    //     lastName: 'Tanczos',
    //     email: 'tanczi@gmail.com',
    //     password: '123456',
    //   })
    //   .save()

    // console.log(user)

    const user = await User.find(1)

    console.log(user)

    return user?.serialize()
  }

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}

  public async tanczi({}: HttpContextContract) {
    return { hello: 'kkfdt' }
  }
}

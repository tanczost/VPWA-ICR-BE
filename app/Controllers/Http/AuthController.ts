// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {
  public async login({ auth, request }: HttpContextContract) {
    const nickName = request.input('nickName')
    const password = request.input('password')

    return auth.use('api').attempt(nickName, password)
  }

  public async verifyToken({ auth }: HttpContextContract) {
    await auth.use('api').authenticate()
  }

  public async logout({ auth }: HttpContextContract) {
    await auth.use('api').revoke()
    return {
      revoked: true,
    }
  }
}

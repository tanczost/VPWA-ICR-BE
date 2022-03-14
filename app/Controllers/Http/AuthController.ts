// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {
  public async login({ auth, request, response }: HttpContextContract) {
    const nickName = request.input('nickName')
    const password = request.input('password')

    // console.log(nickName, password)

    try {
      const token = await auth.use('api').attempt(nickName, password)
      console.log(auth.user?.serialize())
      // const token = await auth.use('api').attempt(nickName, password, {expiresIn: '2days'}) //token with expiration
      return { token, user: auth.user?.serialize() }
    } catch {
      return response.badRequest('Invalid credentials')
    }
  }

  public async verifyToken({ auth }: HttpContextContract) {
    await auth.use('api').authenticate()
    // console.log(auth.use('api').user!)
  }

  public async logout({ auth }: HttpContextContract) {
    await auth.use('api').revoke()
    return {
      revoked: true,
    }
  }
}

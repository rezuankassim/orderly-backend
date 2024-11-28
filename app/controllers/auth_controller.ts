import { loginValidator, registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  async register({ request }: HttpContext) {
    // Register a new user
    const payload = await request.validateUsing(registerValidator)

    // Create a new user
    const user = await User.create({
      fullName: payload.name,
      username: payload.username,
      email: payload.email,
      password: payload.password,
    })
    const token = await User.accessTokens.create(user)

    return {
      user,
      token,
    }
  }

  async login({ request, response }: HttpContext) {
    // Login a user
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)

    const token = await User.accessTokens.create(user)

    return response.send({
      status: 200,
      message: 'Login successful',
      user,
      token,
    })
  }

  async my_info({ auth }: HttpContext) {
    // Get the authenticated user
    const user = auth.user!

    return {
      user,
    }
  }

  async logout({ auth }: HttpContext) {
    // Logout the authenticated user
    const user = auth.getUserOrFail()

    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return {
      status: 200,
      message: 'Logout successful',
    }
  }
}

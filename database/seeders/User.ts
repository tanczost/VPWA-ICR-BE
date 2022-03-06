import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await User.createMany([
      {
        nickName: 'user1',
        lastName: 'Lastname',
        firstName: 'Firstname',
        email: 'user1@adonisjs.com',
        password: '1234',
      },
      {
        nickName: 'user2',
        lastName: 'Lastname',
        firstName: 'Firstname',
        email: 'user2@adonisjs.com',
        password: '1234',
      },
      {
        nickName: 'user3',
        lastName: 'Lastname',
        firstName: 'Firstname',
        email: 'user3@adonisjs.com',
        password: '1234',
      },
    ])
  }
}

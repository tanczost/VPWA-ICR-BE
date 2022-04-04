import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeSave,
  column,
  hasMany,
  HasMany,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import Channel from './Channel'
import Message from './Message'
import Mention from './Mention'
import Kick from './Kick'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'firstName' })
  public firstName: string

  @column({ serializeAs: 'lastName' })
  public lastName: string

  @column({ serializeAs: 'nickName' })
  public nickName: string

  @column()
  public email: string

  @column()
  public notify: boolean

  @column({ serializeAs: null })
  public password: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @hasMany(() => Channel)
  public ownChannels: HasMany<typeof Channel>

  @hasMany(() => Message)
  public messages: HasMany<typeof Message>

  @hasMany(() => Mention)
  public mentiones: HasMany<typeof Mention>

  @hasMany(() => Kick)
  public kicks: HasMany<typeof Kick>

  @manyToMany(() => Channel)
  public channels: ManyToMany<typeof Channel>
}

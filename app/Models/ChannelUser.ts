import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export class ChannelUser extends BaseModel {
  public static table = 'channel_user'

  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public channelId: number

  @column()
  public invitedById: number

  @column()
  public accepted: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

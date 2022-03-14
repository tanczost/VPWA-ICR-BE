import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Invitation extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public inviterId: number

  @column()
  public invitedId: number

  @column()
  public accepted: boolean

  @column()
  public channelId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

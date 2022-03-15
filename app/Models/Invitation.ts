import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Channel from './Channel'

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

  @hasOne(() => Channel, { foreignKey: 'id', localKey: 'channelId', serializeAs: null })
  public channel: HasOne<typeof Channel>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

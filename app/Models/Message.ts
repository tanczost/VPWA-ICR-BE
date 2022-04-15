import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Channel from './Channel'
import User from './User'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public content: { text: string; mentions: string[] }

  @column({ serializeAs: 'userId' })
  public userId: number

  @column({ serializeAs: 'channelId' })
  public channelId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasOne(() => Channel)
  public channel: HasOne<typeof Channel>

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  public author: BelongsTo<typeof User>
}

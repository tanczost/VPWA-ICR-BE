import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ChannelUsers extends BaseSchema {
  protected tableName = 'channel_user'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('user_id').unsigned().references('users.id')
      table.integer('channel_id').unsigned().references('channels.id')
      table.unique(['user_id', 'channel_id'])

      table.timestamp('last_seen', { useTz: true })
      table.integer('kick_number').defaultTo(0)

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

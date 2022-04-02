import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Kicks extends BaseSchema {
  protected tableName = 'kicks'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('user_id').unsigned().references('users.id').notNullable()
      table.integer('channel_id').unsigned().references('channels.id').notNullable()
      table.integer('kicked_by_id').unsigned().references('users.id').notNullable()

      table.unique(['user_id', 'channel_id', 'kicked_by_id'])

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

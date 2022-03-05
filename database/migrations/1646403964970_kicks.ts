import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Kicks extends BaseSchema {
  protected tableName = 'kicks'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('kicker_id').notNullable().references('users.id')
      table.integer('kicked_id').notNullable().references('users.id')
      table.unique(['kicked_id', 'kicker_id'])
      table.integer('channel_id').notNullable().references('channels.id')

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

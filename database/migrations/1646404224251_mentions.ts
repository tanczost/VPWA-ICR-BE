import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Mentions extends BaseSchema {
  protected tableName = 'mentions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('mentioned_id').notNullable().references('users.id')
      table.integer('message_id').notNullable().references('messages.id')
      table.boolean('already_read').defaultTo(false)

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

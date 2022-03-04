import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ReadMessages extends BaseSchema {
  protected tableName = 'read_messages'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('userId').notNullable().references('users.id')
      table.integer('messageId').notNullable().references('messages.id')
      table.boolean('alreadyRead').defaultTo(false)

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

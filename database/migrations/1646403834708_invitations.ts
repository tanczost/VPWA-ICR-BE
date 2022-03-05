import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Invitations extends BaseSchema {
  protected tableName = 'invitations'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('inviterId').notNullable().references('users.id')
      table.integer('invitedId').notNullable().references('users.id')
      table.unique(['invitedId', 'inviterId'])
      table.integer('channelId').notNullable().references('channels.id')
      table.boolean('accepted').defaultTo(false)

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

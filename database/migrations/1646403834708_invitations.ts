import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Invitations extends BaseSchema {
  protected tableName = 'invitations'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('inviter_id').notNullable().references('users.id')
      table.integer('invited_id').notNullable().references('users.id')
      table.unique(['invited_id', 'inviter_id', 'channel_id'])
      table.integer('channel_id').notNullable().references('channels.id')
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

'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddUserToRecipesSchema extends Schema {
  up () {
    this.table('recipes', (table) => {
      table.integer('user_id').unsigned().references('id').inTable('users').after('id')
    })
  }

  down () {
    this.table('recipes', (table) => {
      table.dropForeign('user_id');
      table.dropColumn('user_id')
    })
  }
}

module.exports = AddUserToRecipesSchema

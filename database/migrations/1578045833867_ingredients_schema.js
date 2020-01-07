'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class IngredientsSchema extends Schema {
  up () {
    this.create('ingredients', (table) => {
      table.increments()
      table.integer('recipe_id').unsigned().references('id').inTable('recipes').onDelete('CASCADE')
      table.string('amount')
      table.string('item')
      table.timestamps()
    })
  }

  down () {
    this.drop('ingredients')
  }
}

module.exports = IngredientsSchema

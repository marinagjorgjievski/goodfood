'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RecipesSchema extends Schema {
  up () {
    this.create('recipes', (table) => {
      table.increments()
      table.string('name')
      table.string('image')
      table.string('time')
      table.string('directions')
      table.string('type')
      table.timestamps()
    })
  }

  down () {
    this.drop('recipes')
  }
}

module.exports = RecipesSchema

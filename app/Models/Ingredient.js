'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Ingredient extends Model {

  recipe () {
    return this.belongsTo('App/Models/Recipe')
  }
}

module.exports = Ingredient

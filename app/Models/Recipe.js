'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Recipe extends Model {

  ingredients () {
    return this.hasMany('App/Models/Ingredient')
  }

  user() {
    return this.belongsTo('App/Models/User')
  }
}

module.exports = Recipe

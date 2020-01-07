'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Recipe = use('App/Models/Recipe')
const Ingredient = use('App/Models/Ingredient')
const Helpers = use('Helpers')

class FoodController {

  async index({view}) {
    const recipes = await Recipe.all();  //will bring all recipes
    return view.render('welcome', {
      recipes: recipes.toJSON()
    })
  }

  async create({ view }) {
    return view.render('recipes.add')
  }

  async store({ request, response, session }) {
    const recipe = new Recipe();

    recipe.name = request.input('name')
    recipe.time = request.input('time')
    recipe.directions = request.input('directions')
    recipe.type = request.input('type')

    await recipe.save()

    let ingredientsReqest = request.input('ingredients');
    if (ingredientsReqest && ingredientsReqest.length) {
      const ingredients = await recipe
        .ingredients()
        .createMany(ingredientsReqest)
    }

    const recipePic = request.file('image', {
      types: ['image'],
      size: '2mb'
    })

    if (recipePic) {
      let imageName = 'recipe-pic-' + recipe.id + '.' + recipePic.subtype;

      await recipePic.move(Helpers.publicPath('uploads'), {
        name: imageName,
        overwrite: true
      })

      if (!recipePic.moved()) {

      }

      recipe.image = '/uploads/' + imageName;

      await recipe.save()
    }

    return response.redirect('/recipes-type/'+request.input('type'));
  }

  async show ({ params, request, response, view }) {

  }

  async showType({view, params}) {

    let type = params.type;
    const recipes = await Recipe
      .query()
      .with('ingredients')
      .where('type', type)
      .fetch();
    return view.render('recipes.show-type', {
      recipes: recipes.toJSON(),
      navType: type.toLowerCase()
    })
  }

  async edit ({ params, request, response, view}) {
    const recipe = await Recipe
      .query()
      .with('ingredients')
      .where('id', params.id)
      .firstOrFail();
    return view.render('recipes.edit', {
      recipe: recipe.toJSON()
    })
  }

  async update ({ params, request, response, session, view}) {

    const recipe = await Recipe
      .query()
      .with('ingredients')
      .where('id', params.id)
      .firstOrFail();
    const ingredientsOld = recipe.getRelated('ingredients');

    recipe.name = request.input('name')
    recipe.time = request.input('time')
    recipe.directions = request.input('directions')
    recipe.type = request.input('type')

    let ingredientsReqest = request.input('ingredients');
    if (ingredientsReqest && ingredientsReqest.length) {
      let ingredientsCreate = [];
      ingredientsReqest.forEach(function(ingredient) {
        if (ingredient) {
          if (!ingredient.hasOwnProperty('id')) {
            ingredientsCreate.push(ingredient);
          }
        }
      });
      if (ingredientsCreate.length) {
        const ingredients = await recipe
          .ingredients()
          .createMany(ingredientsCreate)
      }
    }

    ingredientsOld.rows.forEach(function(ingredientOld) {
      let found = false;
      ingredientsReqest.forEach(function(ingredientRequest) {
        if (ingredientRequest) {
          if (ingredientRequest.hasOwnProperty('id')) {
            if (ingredientRequest.id == ingredientOld.id) {
              found = true;
            }
          }
        }
      });

      if (!found) {
        ingredientOld.delete();
      }
    })

    await recipe.save()

    const recipePic = request.file('image', {
      types: ['image'],
      size: '2mb'
    })

    if (recipePic) {

      let imageName = 'recipe-pic-' + recipe.id + '.' + recipePic.subtype;

      await recipePic.move(Helpers.publicPath('uploads'), {
        name: imageName,
        overwrite: true
      })

      if (!recipePic.moved()) {
      }

      recipe.image = '/uploads/' + imageName;

      await recipe.save()
    }

    return response.redirect('/recipes-type/'+request.input('type'));

  }

  async destroy({params, session, response}) {
    const recipe = await Recipe.find(params.id)
    await recipe.delete()
    return response.redirect('back')
  }
}
module.exports = FoodController

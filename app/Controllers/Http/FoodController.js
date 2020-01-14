'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Recipe = use('App/Models/Recipe')
const Ingredient = use('App/Models/Ingredient')
const Helpers = use('Helpers')
const User = use('App/Models/User')

// Bring in validator
const { validate } = use('Validator')

class FoodController {

  async index({view}) {
    const recipes = await Recipe.all();  //will bring all recipes
    return view.render('welcome', {
      recipes: recipes.toJSON()
    })
  }

  async create({ response, view, auth }) {
    try {
      await auth.check()
    } catch (error) {
      return response.route('auth.sign-in')
    }

    return view.render('recipes.add')
  }

  async store({ request, response, session, auth}) {
    try {
      await auth.check()
    } catch (error) {
      return response.route('auth.sign-in')
    }

    const recipe = new Recipe();

    //Validate input
    const validation = await validate(request.all(),{
      name: 'required|min:1|max:255',
      time: 'required|min:1|max:255',
      directions: 'required|min:1',
      type: 'required|min:1|max:255',
    })

    if (validation.fails()) {
      session.withErrors(validation.messages()).flashAll()
      return response.redirect('back')
    }

    recipe.name = request.input('name')
    recipe.time = request.input('time')
    recipe.directions = request.input('directions')
    recipe.type = request.input('type')
    recipe.user_id = auth.user.id

    await recipe.save()

    let ingredientsReqest = request.input('ingredients');
    if (ingredientsReqest && ingredientsReqest.length) {
      let ingredientsCreate = [];
      ingredientsReqest.forEach(function(ingredient) {
        if (ingredient) {
          ingredientsCreate.push(ingredient);
        }
      });

      const ingredients = await recipe
        .ingredients()
        .createMany(ingredientsCreate)
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

      session.flash({ notification: 'Recipe Added!'})
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

  async myRecipes({view, params, auth}) {
    try {
      await auth.check()
    } catch (error) {
      return response.route('auth.sign-in')
    }

    let userId = auth.user.id;

    const recipes = await Recipe
      .query()
      .with('ingredients')
      .where('user_id', userId)
      .fetch();
    return view.render('recipes.my-recipes', {
      recipes: recipes.toJSON(),
      navType: 'my-recipes'
    })
  }

  async edit ({ params, request, response, view, auth}) {
    try {
      await auth.check()
    } catch (error) {
      return response.route('auth.sign-in')
    }

    const recipe = await Recipe
      .query()
      .with('ingredients')
      .where('id', params.id)
      .firstOrFail();

    if (!recipe.user_id) {
      return response.route('auth.sign-in')
    }

    if (recipe.user_id !== auth.user.id) {
      return response.route('auth.sign-in')
    }

    let recipes = await Recipe.pair('id', 'name');

    return view.render('recipes.edit', {
      recipe: recipe.toJSON()
    })
  }

  async update ({ params, request, response, session, view, auth}) {

    const recipe = await Recipe
      .query()
      .with('ingredients')
      .where('id', params.id)
      .firstOrFail();

    const ingredientsOld = recipe.getRelated('ingredients');

    //Validate input
    const validation = await validate(request.all(),{
      name: 'required|min:1|max:255',
      time: 'required|min:1|max:255',
      directions: 'required|min:1',
      type: 'required|min:1'
    })

    if(validation.fails()){
      session.withErrors(validation.messages()).flashAll()
      return response.redirect('back')
    }

    recipe.name = request.input('name')
    recipe.time = request.input('time')
    recipe.directions = request.input('directions')
    recipe.type = request.input('type')
    recipe.user_id = auth.user.id

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

      session.flash({notification: 'Recipe Updated!'})
    }

    return response.redirect('/recipes-type/'+request.input('type'));

  }

  async destroy({params, session, response, request, auth}) {
    try {
      await auth.check()
    } catch (error) {
      return response.route('auth.sign-in')
    }

    const recipe = await Recipe
      .query()
      .where('id', params.id)
      .firstOrFail();

    if (!recipe.user_id) {
      return response.route('auth.sign-in')
    }

    if (recipe.user_id !== auth.user.id) {
      return response.route('auth.sign-in')
    }

    let recipes = await Recipe.pair('id', 'name');

    await recipe.delete()
    session.flash({notification: 'Recipe Deleted'})
    return response.redirect('back');
  }
}
module.exports = FoodController

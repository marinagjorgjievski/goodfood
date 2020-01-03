'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Post = use('App/Models/Post')
const Helpers = use('Helpers')

class FoodController {

  async index({view}) {

    const posts = await Post.all();  //ke gi donese site postovi
    return view.render('welcome', {
      posts: posts.toJSON()
    })
  }

  async create({ view }) {
    return view.render('posts.add')
  }

  async store({ request, response, session }) {
    const post = new Post();

    post.name = request.input('name')
    post.time = request.input('time')
    post.ingredients = request.input('ingredients')
    post.directions = request.input('directions')
    post.type = request.input('type')

    await post.save()

    const postPic = request.file('image', {
      types: ['image'],
      size: '2mb'
    })

    if (postPic) {
      let imageName = 'post-pic-' + post.id + '.' + postPic.subtype;

      await postPic.move(Helpers.publicPath('uploads'), {
        name: imageName,
        overwrite: true
      })

      if (!postPic.moved()) {
        console.log('jkgkh');
      }

      post.image = '/uploads/' + imageName;

      await post.save()
    }

    return response.redirect('/posts-type/'+request.input('type'));
  }

  async show ({ params, request, response, view }) {

  }

  async showType({view, params}) {

    let type = params.type;
    const posts = await Post
      .query()
      .where('type', type)
      .fetch();
    return view.render('posts.show-type', {
      posts: posts.toJSON(),
      navType: type.toLowerCase()
    })
  }

  async edit ({ params, request, response, view}) {

    const posts = await Post
      .query()
      .where('id', params.id)
      .firstOrFail();
    return view.render('posts.edit', {
      post: posts.toJSON()
    })
  }

  async update ({ params, request, response, session, view}) {

    const post = await Post
      .query()
      .where('id', params.id)
      .firstOrFail();

    post.name = request.input('name')
    post.time = request.input('time')
    post.ingredients = request.input('ingredients')
    post.directions = request.input('directions')
    post.type = request.input('type')

    await post.save()

    const postPic = request.file('image', {
      types: ['image'],
      size: '2mb'
    })

    if (postPic) {

      let imageName = 'post-pic-' + post.id + '.' + postPic.subtype;

      await postPic.move(Helpers.publicPath('uploads'), {
        name: imageName,
        overwrite: true
      })

      if (!postPic.moved()) {
      }

      post.image = '/uploads/' + imageName;

      await post.save()
    }

    return response.redirect('/posts-type/'+request.input('type'));

  }

  async destroy({params, session, response}) {
    const post = await Post.find(params.id)
    await post.delete()
    return response.redirect('back')
  }
}
module.exports = FoodController

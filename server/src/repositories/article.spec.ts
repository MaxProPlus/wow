import ConfigProvider from '../services/config'
import DB from '../services/mysql'
import ArticleRepository from './article'
import {Article, CommentArticle} from '../common/entity/types'
import {ArticleNotFoundError} from '../providers/article'
import {NotFoundError} from '../errors'

describe('ArticleRepository', () => {
  let repository: ArticleRepository
  let pool: any
  beforeEach(() => {
    const configProvider = new ConfigProvider()
    pool = new DB(configProvider.get('db')).getPoolPromise()
    repository = new ArticleRepository(pool)
  })
  describe('insert', () => {
    it('should return the id of the created', () => {
      jest.spyOn(pool, 'query').mockResolvedValue([{insertId: 1}])
      const article = new Article()

      return repository.insert(article).then((id) => {
        expect(id).toBe(1)
      })
    })
  })
  describe('select', () => {
    it('should return the item', async () => {
      const article = new Article()
      article.title = 'TestArticle'
      jest.spyOn(pool, 'query').mockResolvedValue([[article]])

      return expect(await repository.selectById(1)).toBe(article)
    })
    it('should return the error not found', async () => {
      jest.spyOn(pool, 'query').mockResolvedValue([[]])

      return repository.selectById(1).catch((err) => {
        expect(err).toBeInstanceOf(ArticleNotFoundError)
      })
    })
  })
  describe('selectAll', () => {
    it('should return an array of items', () => {
      const articles = [new Article(), new Article(), new Article()]
      jest.spyOn(pool, 'query').mockResolvedValue([articles])

      return repository.selectAll(10, 1).then((results) => {
        expect(results).toBe(articles)
      })
    })
  })
  describe('selectCount', () => {
    it('should return the count of items', () => {
      const selectCount = {count: 1}
      jest.spyOn(pool, 'query').mockResolvedValue([[selectCount]])

      return expect(repository.selectCount()).resolves.toBe(selectCount.count)
    })
  })
  describe('update', () => {
    it('should return the id of the updated item', () => {
      const article = new Article()
      article.id = 1
      jest.spyOn(pool, 'query').mockResolvedValue([{affectedRows: 1}])

      return expect(repository.update(article)).resolves.toBe(article.id)
    })
    it('should return the error not found', () => {
      const article = new Article()
      jest.spyOn(pool, 'query').mockResolvedValue([{affectedRows: 0}])

      return expect(repository.update(article)).rejects.toBeInstanceOf(
        ArticleNotFoundError
      )
    })
  })
  describe('remove', () => {
    it('should return the id of the removed item', () => {
      jest.spyOn(pool, 'query').mockResolvedValue([{affectedRows: 1}])

      return expect(repository.remove(1)).resolves.toBe(1)
    })
    it('should return the error not found', () => {
      jest.spyOn(pool, 'query').mockResolvedValue([{affectedRows: 0}])

      return expect(repository.remove(1)).rejects.toBeInstanceOf(
        ArticleNotFoundError
      )
    })
  })
  describe('insertComment', () => {
    it('should return the if of the created comment', () => {
      const comment = new CommentArticle()
      comment.id = 1
      jest.spyOn(pool, 'query').mockResolvedValue([{insertId: comment.id}])

      return expect(repository.insertComment(comment)).resolves.toBe(comment.id)
    })
  })
  describe('selectCommentById', () => {
    it('should return the comment', () => {
      const comment = new CommentArticle()
      comment.id = 1
      jest.spyOn(pool, 'query').mockResolvedValue([[comment]])

      return expect(repository.selectCommentById(comment.id)).resolves.toBe(
        comment
      )
    })
    it('should return the error not found', () => {
      jest.spyOn(pool, 'query').mockResolvedValue([[]])

      return expect(repository.selectCommentById(1)).rejects.toBeInstanceOf(
        NotFoundError
      )
    })
  })
  describe('selectCommentsByIdArticle', () => {
    it('should return an array of comments', () => {
      const comments = [
        new CommentArticle(),
        new CommentArticle(),
        new CommentArticle(),
      ]
      jest.spyOn(pool, 'query').mockResolvedValue([comments])

      return expect(repository.selectCommentsByIdArticle(1)).resolves.toBe(
        comments
      )
    })
  })
  describe('removeComment', () => {
    it('should return the id of the removed comment', () => {
      jest.spyOn(pool, 'query').mockResolvedValue([{affectedRows: 1}])

      return expect(repository.removeComment(1)).resolves.toBe(1)
    })
    it('should return the error not found', () => {
      jest.spyOn(pool, 'query').mockResolvedValue([{affectedRows: 0}])

      return expect(repository.removeComment(1)).rejects.toBeInstanceOf(
        NotFoundError
      )
    })
  })
})

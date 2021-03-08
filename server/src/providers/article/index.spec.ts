import ArticleRepository from '../../repositories/article'
import Uploader from '../../services/uploader'
import ArticleProvider, {ArticleNotFoundError} from './index'
import ConfigProvider from '../../services/config'
import DB from '../../services/mysql'
import {ArticleUpload} from '../../entity/types'
import {Article, CommentArticle} from '../../common/entity/types'
import {ForbiddenError} from '../../errors'
import Hash from '../../services/hash'

describe('ArticleProvider', () => {
  let repository: ArticleRepository
  let uploader: Uploader
  let provider: ArticleProvider
  beforeEach(() => {
    repository = new ArticleRepository(new DB(new ConfigProvider().get('db')))
    uploader = new Uploader(new Hash(), {} as any)
    provider = new ArticleProvider(repository, uploader)
  })
  describe('create', () => {
    it('should return the id of the created item', async () => {
      const article = new ArticleUpload()
      article.id = 1
      article.fileAvatar = {
        mv: jest.fn().mockResolvedValue({}),
      } as any
      jest.spyOn(repository, 'insert').mockResolvedValue(article.id)
      jest.spyOn(uploader, 'move').mockResolvedValue('/uploads/file.png')

      await expect(provider.create(article)).resolves.toBe(article.id)
      expect(article.fileAvatar.mv).toBeCalled()
    })
  })
  describe('getById', () => {
    it('should return the article with the comments', () => {
      const article = new Article()
      article.id = 1
      const comments = [new CommentArticle(), new CommentArticle()]
      jest.spyOn(repository, 'selectById').mockResolvedValue(article)
      jest.spyOn(provider, 'getComments').mockResolvedValue(comments)

      return expect(provider.getById(article.id)).resolves.toEqual([
        article,
        comments,
      ])
    })
    it('should return the error not found', () => {
      const article = new Article()
      article.id = 1
      jest
        .spyOn(repository, 'selectById')
        .mockRejectedValue(new ArticleNotFoundError())
      jest.spyOn(provider, 'getComments').mockResolvedValue([])

      return expect(provider.getById(article.id)).rejects.toBeInstanceOf(
        ArticleNotFoundError
      )
    })
  })
  describe('getAll', () => {
    it('should return an array of articles', () => {
      const articles = [new Article(), new Article()]
      jest.spyOn(repository, 'selectAll').mockResolvedValue(articles)
      jest.spyOn(repository, 'selectCount').mockResolvedValue(articles.length)

      return expect(provider.getAll(10, 1)).resolves.toEqual({
        data: articles,
        count: articles.length,
      })
    })
  })
  describe('update', () => {
    it('should return the id of the updated item', () => {
      const article = new ArticleUpload()
      article.id = 1
      jest.spyOn(repository, 'selectById').mockResolvedValue(article)
      jest.spyOn(repository, 'update').mockResolvedValue(article.id)

      return expect(provider.update(article)).resolves.toBe(article.id)
    })
    it('should return the id of the updated item when the file is attached', async () => {
      const article = new ArticleUpload()
      article.id = 1
      article.fileAvatar = {
        mv: jest.fn().mockResolvedValue({}),
      } as any
      jest.spyOn(repository, 'selectById').mockResolvedValue(article)
      jest.spyOn(uploader, 'remove').mockReturnValue()
      jest.spyOn(uploader, 'move').mockResolvedValue('/uploads/file.png')
      jest.spyOn(repository, 'update').mockResolvedValue(article.id)

      await expect(provider.update(article)).resolves.toBe(article.id)
      expect(article.fileAvatar.mv).toBeCalled()
    })
  })
  describe('remove', () => {
    it('should return the id of the removed item for creator', () => {
      const article = new Article()
      article.id = 1
      article.idUser = 1
      jest.spyOn(repository, 'selectById').mockResolvedValue(article)
      jest.spyOn(repository, 'remove').mockResolvedValue(article.id)
      jest.spyOn(uploader, 'remove').mockReturnValue()

      return expect(provider.remove(article)).resolves.toBe(article.id)
    })
    it('should return the forbidden error', () => {
      const article = new Article()
      article.id = 1
      article.idUser = 1
      const oldArticle = new Article()
      oldArticle.idUser = 2
      jest.spyOn(repository, 'selectById').mockResolvedValue(oldArticle)
      jest.spyOn(repository, 'remove').mockResolvedValue(article.id)
      jest.spyOn(uploader, 'remove').mockReturnValue()

      return expect(provider.remove(article)).rejects.toBeInstanceOf(
        ForbiddenError
      )
    })
  })
  describe('createComment', () => {
    it('should return the id of the created comment for the creator item', () => {
      const article = new Article()
      article.id = 1
      article.idUser = 1
      const comment = new CommentArticle()
      comment.id = 1
      comment.idArticle = article.id
      comment.idUser = 1
      jest.spyOn(repository, 'selectById').mockResolvedValue(article)
      jest.spyOn(repository, 'insertComment').mockResolvedValue(comment.id)

      return expect(provider.createComment(comment)).resolves.toBe(comment.id)
    })
    it('should return the id of the created comment for the creator when the comment is blocked', () => {
      const article = new Article()
      article.id = 1
      article.comment = 1
      article.idUser = 1
      const comment = new CommentArticle()
      comment.id = 1
      comment.idArticle = article.id
      comment.idUser = 1
      jest.spyOn(repository, 'selectById').mockResolvedValue(article)
      jest.spyOn(repository, 'insertComment').mockResolvedValue(comment.id)

      return expect(provider.createComment(comment)).resolves.toBe(comment.id)
    })
    it('should return the id of the created comment for the creator when the comment is closed', () => {
      const article = new Article()
      article.id = 1
      article.closed = 1
      article.idUser = 1
      const comment = new CommentArticle()
      comment.id = 1
      comment.idArticle = article.id
      comment.idUser = 1
      jest.spyOn(repository, 'selectById').mockResolvedValue(article)
      jest.spyOn(repository, 'insertComment').mockResolvedValue(comment.id)

      return expect(provider.createComment(comment)).resolves.toBe(comment.id)
    })
    it('should return the id of the created comment for the creator when the comment is blocked and closed', () => {
      const article = new Article()
      article.id = 1
      article.closed = 1
      article.comment = 1
      article.idUser = 1
      const comment = new CommentArticle()
      comment.id = 1
      comment.idArticle = article.id
      comment.idUser = 1
      jest.spyOn(repository, 'selectById').mockResolvedValue(article)
      jest.spyOn(repository, 'insertComment').mockResolvedValue(comment.id)

      return expect(provider.createComment(comment)).resolves.toBe(comment.id)
    })
    it('should return the id of the created comment', () => {
      const article = new Article()
      article.id = 1
      article.idUser = 1
      const comment = new CommentArticle()
      comment.id = 1
      comment.idArticle = article.id
      comment.idUser = 2
      jest.spyOn(repository, 'selectById').mockResolvedValue(article)
      jest.spyOn(repository, 'insertComment').mockResolvedValue(comment.id)

      return expect(provider.createComment(comment)).resolves.toBe(comment.id)
    })
    it('should return a forbidden error when the comment is blocked', () => {
      const article = new Article()
      article.id = 1
      article.comment = 1
      article.idUser = 1
      const comment = new CommentArticle()
      comment.id = 1
      comment.idArticle = article.id
      comment.idUser = 2
      jest.spyOn(repository, 'selectById').mockResolvedValue(article)
      jest.spyOn(repository, 'insertComment').mockResolvedValue(comment.id)

      return expect(provider.createComment(comment)).rejects.toBeInstanceOf(
        ForbiddenError
      )
    })
    it('should return a forbidden error when the comment is closed', () => {
      const article = new Article()
      article.id = 1
      article.closed = 1
      article.idUser = 1
      const comment = new CommentArticle()
      comment.id = 1
      comment.idArticle = article.id
      comment.idUser = 2
      jest.spyOn(repository, 'selectById').mockResolvedValue(article)
      jest.spyOn(repository, 'insertComment').mockResolvedValue(comment.id)

      return expect(provider.createComment(comment)).rejects.toBeInstanceOf(
        ForbiddenError
      )
    })
    it('should return a forbidden error when the comment is blocked and closed', () => {
      const article = new Article()
      article.id = 1
      article.comment = 1
      article.closed = 1
      article.idUser = 1
      const comment = new CommentArticle()
      comment.id = 1
      comment.idArticle = article.id
      comment.idUser = 2
      jest.spyOn(repository, 'selectById').mockResolvedValue(article)
      jest.spyOn(repository, 'insertComment').mockResolvedValue(comment.id)

      return expect(provider.createComment(comment)).rejects.toBeInstanceOf(
        ForbiddenError
      )
    })
  })
  describe('getComments', () => {
    it('should return the array of the comments', () => {
      const comment = new CommentArticle()
      comment.authorUrlAvatar = 'photo.png'
      const comments = [comment, comment, comment]
      jest
        .spyOn(repository, 'selectCommentsByIdArticle')
        .mockResolvedValue(comments)

      return expect(provider.getComments(1)).resolves.toEqual(comments)
    })
  })
  describe('removeComment', () => {
    it("should return the id of the removed comment for the creator's comment", () => {
      const article = new Article()
      article.id = 1
      const comment = new CommentArticle()
      comment.id = 1
      comment.idArticle = article.id
      comment.idUser = 1
      const oldComment = new CommentArticle()
      oldComment.id = comment.id
      oldComment.idArticle = article.id
      oldComment.idUser = 1
      jest.spyOn(repository, 'selectById').mockResolvedValue(article)
      jest.spyOn(repository, 'selectCommentById').mockResolvedValue(oldComment)
      jest.spyOn(repository, 'removeComment').mockResolvedValue(comment.id)

      return expect(provider.removeComment(comment, false)).resolves.toBe(
        comment.id
      )
    })
    it("should return the id of the removed comment for the creator's item", () => {
      const article = new Article()
      article.id = 1
      article.idUser = 1
      const comment = new CommentArticle()
      comment.id = 1
      comment.idArticle = article.id
      comment.idUser = 1
      const oldComment = new CommentArticle()
      oldComment.id = comment.id
      oldComment.idArticle = article.id
      oldComment.idUser = 2
      jest.spyOn(repository, 'selectById').mockResolvedValue(article)
      jest.spyOn(repository, 'selectCommentById').mockResolvedValue(oldComment)
      jest.spyOn(repository, 'removeComment').mockResolvedValue(comment.id)

      return expect(provider.removeComment(comment, false)).resolves.toBe(
        comment.id
      )
    })
    it('should return the id of the removed comment when the right is true', () => {
      const article = new Article()
      article.id = 1
      article.idUser = 1
      const comment = new CommentArticle()
      comment.id = 1
      comment.idArticle = article.id
      comment.idUser = 2
      const oldComment = new CommentArticle()
      oldComment.id = comment.id
      oldComment.idArticle = article.id
      oldComment.idUser = 3
      jest.spyOn(repository, 'selectById').mockResolvedValue(article)
      jest.spyOn(repository, 'selectCommentById').mockResolvedValue(oldComment)
      jest.spyOn(repository, 'removeComment').mockResolvedValue(comment.id)

      return expect(provider.removeComment(comment, true)).resolves.toBe(
        comment.id
      )
    })
    it('should return the forbidden error when another user tries to delete a comment without permission', () => {
      const article = new Article()
      article.id = 1
      article.idUser = 1
      const comment = new CommentArticle()
      comment.id = 1
      comment.idArticle = article.id
      comment.idUser = 2
      const oldComment = new CommentArticle()
      oldComment.id = comment.id
      oldComment.idArticle = article.id
      oldComment.idUser = 3
      jest.spyOn(repository, 'selectById').mockResolvedValue(article)
      jest.spyOn(repository, 'selectCommentById').mockResolvedValue(oldComment)
      jest.spyOn(repository, 'removeComment').mockResolvedValue(comment.id)

      return expect(
        provider.removeComment(comment, false)
      ).rejects.toBeInstanceOf(ForbiddenError)
    })
  })
})

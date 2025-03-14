import express from 'express'
const router = express.Router()

// 服務層的函式
import {
  getUsers,
  getUserById,
  createUser,
  updateUserProfileById,
  updateUserPasswordById,
} from '../services/user.js'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '../lib/utils.js'
// 中介軟體，用來驗證使用者的身份
import authenticate from '../middlewares/authenticate.js'
// 用來處理FormData的中介軟體，上傳檔案用使用multer
import path from 'path'
import multer from 'multer'

// #region ------ multer ------
//  multer的設定值
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    // 存放目錄
    callback(null, 'public/avatar/')
  },
  filename: function (req, file, callback) {
    // 經授權後，檔名用req.user帶有會員的id
    const newFilename = req.user.id
    // 或是新檔名由表單傳來的req.body.newFilename決定
    //const newFilename = req.query.filename
    callback(null, newFilename + path.extname(file.originalname))
  },
})
const upload = multer({ storage: storage })
// `upload.none()`可用來處理沒有檔案上傳時，要獲取FormData的資料
// #endregion ------------

// #region ------ GET ------
// 得到所有會員資料
// 網址: /api/users
router.get('/', async (req, res) => {
  try {
    // 需要加上await等待取得資料
    const users = await getUsers()
    successResponse(res, { users })
  } catch (error) {
    errorResponse(res, error)
  }
})

// 得到單筆資料(透過授權的直接使用JWT token中的id)
// 網址: /api/users/me
router.get('/me', authenticate, async (req, res) => {
  // 取得使用者id，從req.user.id取得(透過JWT解碼)
  const userId = req.user.id
  // 如果是開發環境，顯示訊息
  if (isDev) console.log('userId', userId)

  try {
    // 需要加上await等待取得資料
    const user = await getUserById(userId)
    successResponse(res, { user })
  } catch (error) {
    errorResponse(res, error)
  }
})

// 得到單筆資料(注意，網址有動態參數時要寫在GET區段最後面)
// 網址: /api/users/:id
router.get('/:userId', async (req, res) => {
  // 需要轉換成數字
  const userId = Number(req.params.userId)
  // 如果是開發環境，顯示訊息
  if (isDev) console.log('userId', userId)

  try {
    // 需要加上await等待取得資料
    const user = await getUserById(userId)
    successResponse(res, { user })
  } catch (error) {
    errorResponse(res, error)
  }
})
// #endregion ------------

// #region ------ POST ------
// 新增會員資料(註冊會員使用)
router.post('/', upload.none(), async (req, res) => {
  // 取得請求的資料
  const newUser = req.body
  // 如果是開發環境，顯示訊息
  if (isDev) console.log('req.body', req.body)

  try {
    const user = await createUser(newUser)
    // 如果是開發環境，顯示訊息
    if (isDev) console.log('user', user)

    // 成功建立會員的回應
    successResponse(res, null, 201)
  } catch (error) {
    errorResponse(res, error)
  }
})

// #region ------ PUT ------
// 更新會員資料(透過授權的直接使用JWT token中的id)
router.put('/me/profile', upload.none(), authenticate, async (req, res) => {
  // 取得請求的資料
  const updatedUser = req.body
  // 取得使用者id，從req.user.id取得(透過JWT解碼)
  const userId = req.user.id
  // 如果是開發環境，顯示訊息
  if (isDev) console.log('userId', userId, 'updatedUser', updatedUser)

  try {
    await updateUserProfileById(userId, updatedUser)
    // 成功更新會員的回應
    successResponse(res)
  } catch (error) {
    errorResponse(res, error)
  }
})
// 更新會員密碼(透過授權的直接使用JWT token中的id)
router.put('/me/password', upload.none(), authenticate, async (req, res) => {
  // 取得請求的資料
  // 格式: { currentPassword: '舊密碼', newPassword: '新密碼' }
  const updatedPassword = req.body
  // 取得使用者id，從req.user.id取得(透過JWT解碼)
  const userId = req.user.id
  // 如果是開發環境，顯示訊息
  if (isDev) console.log('userId', userId, 'updatedPassword', updatedPassword)

  try {
    await updateUserPasswordById(userId, updatedPassword)
    // 成功更新會員的回應
    successResponse(res)
  } catch (error) {
    errorResponse(res, error)
  }
})
// 更新會員密碼
router.put('/:userId/password', upload.none(), async (req, res) => {
  // 取得請求的資料
  // 格式: { currentPassword: '舊密碼', newPassword: '新密碼' }
  const updatedPassword = req.body
  // 取得使用者id，從req.params.userId取得，並轉換成數字
  const userId = Number(req.params.userId)
  // 如果是開發環境，顯示訊息
  if (isDev) console.log('userId', userId, 'updatedPassword', updatedPassword)

  try {
    await updateUserPasswordById(userId, updatedPassword)
    // 成功更新會員的回應
    successResponse(res)
  } catch (error) {
    errorResponse(res, error)
  }
})
// 更新會員資料(網址有動態參數要寫在PUT區段最後面)
router.put('/:userId/profile', upload.none(), async (req, res) => {
  // 取得請求的資料
  const updatedUser = req.body
  // 取得使用者id，從req.params.userId取得，並轉換成數字
  const userId = Number(req.params.userId)
  // 如果是開發環境，顯示訊息
  if (isDev) console.log('userId', userId, 'updatedUser', updatedUser)

  try {
    await updateUserProfileById(userId, updatedUser)
    // 成功更新會員的回應
    successResponse(res)
  } catch (error) {
    errorResponse(res, error)
  }
})
// #endregion ------------

// #region ------ DELETE ------
// #endregion ------------

export default router

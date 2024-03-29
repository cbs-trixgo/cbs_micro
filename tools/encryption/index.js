// Cipher data must be a string or a buffer
let unencryptedSecret = JSON.stringify(listUser)

// Mã hóa
let listUserEncryted = await crypto.AES.encrypt(
  unencryptedSecret,
  process.env.SECRET_KEY_CRYPTO
).toString()

// Xử lí mã hóa data bên phía client
// Xem chuỗi đã mã hóa
// Lấy danh sách byte đã mã hóa
let bytes = crypto.AES.decrypt(listUserEncryted, process.env.SECRET_KEY_CRYPTO)

// Chuyển sang chuỗi gốc
let message_decode = JSON.parse(bytes.toString(crypto.enc.Utf8))
console.log({ message_decode })

import crypto from 'crypto'

// encrypt key
export const encryptKey = (key) => {
  //encrypt openAIKey with aes256
  const algorithm = 'aes-256-cbc'
  const password = process.env.OPENAI_KEY_ENCRYPTION_PASSWORD
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, password, iv)
  //encrypt, prepend iv, and encode to base64
  return Buffer.concat([iv, cipher.update(key), cipher.final()]).toString('base64')
}

//decrypt key
export const decryptKey = (encrypted) => {
  //decrypt openAIKey aes256
  const algorithm = 'aes-256-cbc'
  const password = process.env.OPENAI_KEY_ENCRYPTION_PASSWORD
  const encryptedBuffer = Uint8Array.from(Buffer.from(encrypted, 'base64'))

  // Extract the IV from the encrypted data
  const iv = encryptedBuffer.slice(0, 16)

  // Extract the actual encrypted content
  const encryptedContent = encryptedBuffer.slice(16)
  // Create a decipher object using the same algorithm, password, and IV
  const decipher = crypto.createDecipheriv(algorithm, password, iv)

  // Decrypt the data
  const decryptedData = Buffer.concat([decipher.update(encryptedContent), decipher.final()])

  return decryptedData.toString()
}

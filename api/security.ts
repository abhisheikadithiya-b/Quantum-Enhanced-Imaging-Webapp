import crypto from 'crypto'

const SECRET = process.env.SESSION_SECRET || 'quantascan-secure-default-secret-key-32chars'

// Hash password using PBKDF2
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

// Verify password (supports PBKDF2 verification, with plaintext fallback for initial seeds)
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false
  const parts = storedHash.split(':')
  if (parts.length !== 2) {
    // Plaintext fallback for seed database accounts
    return password === storedHash
  }
  const [salt, hash] = parts
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return hash === verifyHash
}

// Generate an encrypted AES-256-CBC session token
export function generateToken(payload: any): string {
  const data = JSON.stringify({
    ...payload,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24-hour expiration
  })
  
  const key = crypto.scryptSync(SECRET, 'salt', 32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return `${iv.toString('hex')}:${encrypted}`
}

// Decrypt and verify an AES-256-CBC session token
export function verifyToken(token: string): any | null {
  if (!token) return null
  const parts = token.split(':')
  if (parts.length !== 2) return null
  
  try {
    const [ivHex, encryptedHex] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const key = crypto.scryptSync(SECRET, 'salt', 32)
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    const payload = JSON.parse(decrypted)
    if (payload.expiresAt < Date.now()) {
      return null // Expired
    }
    return payload
  } catch (e) {
    return null // Decryption failed or JSON parse failed
  }
}

// Middleware helper to authorize headers in Vercel endpoints
export function getAuthorizedUser(req: any): any | null {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.substring(7)
  return verifyToken(token)
}

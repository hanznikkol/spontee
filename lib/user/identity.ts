// lib/user/identity.ts
const USER_ID_KEY = 'spontee:user_id'
const USER_NAME_KEY = 'spontee:user_name'

export function getUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(USER_ID_KEY, id)
  }
  return id
}

export function getUserName(): string {
  return localStorage.getItem(USER_NAME_KEY) ?? `User_${getUserId().slice(0, 6)}`
}

export function setUserName(name: string): void {
  localStorage.setItem(USER_NAME_KEY, name.trim())
}
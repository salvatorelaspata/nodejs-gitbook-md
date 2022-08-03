import { createClient } from 'redis'
export const redisClient = async () => {
  const client = createClient()
  await client.connect()
  return client
}
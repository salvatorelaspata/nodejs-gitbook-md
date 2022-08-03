import axios from 'axios'
import { config } from 'dotenv'
config()

const { GITBOOK_API_URL, GITBOOK_API_KEY } = process.env

export const gitbookAPI = axios.create({
  baseURL: GITBOOK_API_URL,
  headers: { Authorization: 'Bearer ' + GITBOOK_API_KEY }
})

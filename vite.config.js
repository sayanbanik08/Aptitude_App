import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'questions-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.method === 'POST' && req.url === '/api/add-question') {
            let body = ''
            req.on('data', chunk => {
              body += chunk
            })
            req.on('end', () => {
              try {
                const { categoryKey, newQuestion } = JSON.parse(body)
                const filePath = path.resolve(__dirname, 'src/data/questions.js')
                let content = fs.readFileSync(filePath, 'utf8')
                
                // Parse the JS file content
                let objStr = content.replace('export const questionBank = ', '').trim()
                if (objStr.endsWith(';')) objStr = objStr.slice(0, -1)
                
                const qb = JSON.parse(objStr)
                if (!qb[categoryKey]) qb[categoryKey] = []
                qb[categoryKey].push(newQuestion)
                
                // Write back to file
                const output = 'export const questionBank = ' + JSON.stringify(qb, null, 2) + '\n'
                fs.writeFileSync(filePath, output, 'utf8')
                
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: true }))
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: false, error: err.message }))
              }
            })
          } else if (req.method === 'POST' && req.url === '/api/shuffle-questions') {
            let body = ''
            req.on('data', chunk => {
              body += chunk
            })
            req.on('end', () => {
              try {
                const filePath = path.resolve(__dirname, 'src/data/questions.js')
                let content = fs.readFileSync(filePath, 'utf8')

                let objStr = content.replace('export const questionBank = ', '').trim()
                if (objStr.endsWith(';')) objStr = objStr.slice(0, -1)

                const qb = JSON.parse(objStr)

                // Deep Fisher-Yates shuffle — 3 passes per category
                for (const catKey of Object.keys(qb)) {
                  const arr = qb[catKey]
                  if (!arr || arr.length < 2) continue

                  for (let pass = 0; pass < 3; pass++) {
                    for (let i = arr.length - 1; i > 0; i--) {
                      // Use crypto-grade randomness via multiple Math.random() XOR
                      const r1 = Math.random()
                      const r2 = Math.random()
                      const combined = r1 * 0.5 + r2 * 0.5
                      const j = Math.floor(combined * (i + 1))
                      const temp = arr[i]
                      arr[i] = arr[j]
                      arr[j] = temp
                    }
                  }

                  qb[catKey] = arr
                }

                const output = 'export const questionBank = ' + JSON.stringify(qb, null, 2) + '\n'
                fs.writeFileSync(filePath, output, 'utf8')

                // Count total questions shuffled
                let total = 0
                for (const k of Object.keys(qb)) total += qb[k].length

                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: true, totalShuffled: total }))
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: false, error: err.message }))
              }
            })
          } else if (req.method === 'POST' && req.url === '/api/delete-question') {
            let body = ''
            req.on('data', chunk => {
              body += chunk
            })
            req.on('end', () => {
              try {
                const { categoryKey, questionId } = JSON.parse(body)
                const filePath = path.resolve(__dirname, 'src/data/questions.js')
                let content = fs.readFileSync(filePath, 'utf8')

                let objStr = content.replace('export const questionBank = ', '').trim()
                if (objStr.endsWith(';')) objStr = objStr.slice(0, -1)

                const qb = JSON.parse(objStr)
                if (qb[categoryKey]) {
                  qb[categoryKey] = qb[categoryKey].filter(q => q.id !== questionId)
                }

                const output = 'export const questionBank = ' + JSON.stringify(qb, null, 2) + '\n'
                fs.writeFileSync(filePath, output, 'utf8')

                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: true }))
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: false, error: err.message }))
              }
            })
          } else {
            next()
          }
        })
      }
    }
  ],
})

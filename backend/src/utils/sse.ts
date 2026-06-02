import { Response } from 'express'

type Client = { res: Response; userId: string }

const clients: Client[] = []

export function registerClient(res: Response, userId: string) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })
  res.write('\n')

  const client: Client = { res, userId }
  clients.push(client)

  reqOnClose(res, () => {
    const idx = clients.indexOf(client)
    if (idx !== -1) clients.splice(idx, 1)
  })
}

function reqOnClose(res: Response, cb: () => void) {
  // attempt to detect close on both Node and proxied setups
  res.on && res.on('close', cb)
  // fallback: when finished
  res.on && res.on('finish', cb)
}

export function broadcast(userId: string, event: string, payload: any) {
  const data = JSON.stringify(payload)
  for (const c of clients) {
    if (c.userId !== userId) continue
    try {
      c.res.write(`event: ${event}\n`)
      c.res.write(`data: ${data}\n\n`)
    } catch (e) {
      // ignore individual client errors
    }
  }
}

export default { registerClient, broadcast }

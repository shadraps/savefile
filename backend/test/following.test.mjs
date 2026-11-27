import assert from 'node:assert/strict'
import { once } from 'node:events'
import { after, before, mock, test } from 'node:test'
import express from 'express'

let results = []
let queries = []
let authenticated = true

// Test the HTTP routes with only the external database client replaced.
mock.module('../src/supabase.ts', {
  namedExports: { supabase: { from(table) {
    const query = { table, calls: [] }
    queries.push(query)
    const builder = { then(resolve, reject) {
      assert.ok(results.length, `Unexpected query to ${table}`)
      return Promise.resolve(results.shift()).then(resolve, reject)
    } }
    for (const method of ['select', 'eq', 'in', 'order', 'maybeSingle']) {
      builder[method] = (...args) => { query.calls.push([method, ...args]); return builder }
    }
    return builder
  } } },
})
const { default: router } = await import('../src/routes/following.ts')
const app = express()
app.use((_req, res, next) => {
  if (authenticated) res.locals.user = { user_metadata: { username: 'viewer' } }
  next()
})
app.use('/api/following', router)
let server
let baseUrl
before(async () => {
  server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  baseUrl = `http://127.0.0.1:${server.address().port}/api/following`
})
after(() => new Promise((resolve) => server.close(resolve)))

const ok = (data) => ({ data, error: null })
const authorRow = { user_id: 7, username: 'alex', display_name: 'Alex', created_at: '2026-01-01T00:00:00Z' }
const author = authorRow
function seed(...responses) { authenticated = true; queries = []; results = responses }
async function request(path = '') {
  const response = await fetch(`${baseUrl}${path}`)
  return { status: response.status, body: await response.json() }
}

test('rejects unauthenticated requests before querying', async () => {
  seed()
  authenticated = false
  assert.equal((await request()).status, 401)
  assert.deepEqual(queries, [])
})
test('returns 404 for a missing application profile', async () => {
  seed(ok(null))
  assert.equal((await request()).status, 404)
  assert.equal(queries.length, 1)
})
for (const path of ['', '/reviews']) {
  test(`returns an empty ${path || 'following'} list without querying an empty ID set`, async () => {
    seed(ok({ user_id: 42 }), ok([]))
    assert.deepEqual(await request(path), { status: 200, body: path ? { reviews: [] } : { following: [] } })
    assert.equal(queries.length, 2)
  })
}
test('resolves the viewer ID and returns complete followed records unchanged', async () => {
  seed(ok({ user_id: 42 }), ok([{ following_id: 7 }]), ok([authorRow]))
  assert.deepEqual(await request(), { status: 200, body: { following: [author] } })
  assert.deepEqual(queries[0].calls, [['select', 'user_id'], ['eq', 'username', 'viewer'], ['maybeSingle']])
  assert.deepEqual(queries[1], { table: 'follows', calls: [['select', 'following_id'], ['eq', 'follower_id', 42]] })
  assert.deepEqual(queries[2].calls[0], ['select', '*'])
  assert.deepEqual(queries[2].calls.slice(1), [
    ['in', 'user_id', [7]], ['order', 'display_name', { ascending: true }], ['order', 'username', { ascending: true }],
  ])
})
test('restricts reviews to followed IDs, orders newest first, and returns complete review records', async () => {
  const row = { review_id: 3, user_id: 7, game_name: 'Portal 2', score: 9, review: 'Great puzzles.', created_at: '2026-11-25T18:00:00Z' }
  seed(ok({ user_id: 42 }), ok([{ following_id: 7 }]), ok([authorRow]), ok([row]))
  assert.deepEqual(await request('/reviews'), {
    status: 200,
    body: { reviews: [row] },
  })
  assert.equal(queries[3].table, 'reviews')
  assert.deepEqual(queries[3].calls[0], ['select', '*'])
  assert.deepEqual(queries[3].calls.slice(1), [
    ['in', 'user_id', [7]], ['order', 'created_at', { ascending: false }], ['order', 'review_id', { ascending: false }],
  ])
})
for (let stage = 0; stage < 4; stage++) {
  test(`returns database errors from query stage ${stage + 1}`, async () => {
    const responses = [ok({ user_id: 42 }), ok([{ following_id: 7 }]), ok([authorRow])].slice(0, stage)
    seed(...responses, { data: null, error: { message: 'Database unavailable' } })
    assert.deepEqual(await request('/reviews'), { status: 500, body: { error: 'Database unavailable' } })
    assert.equal(queries.length, stage + 1)
  })
}

test('preserves additional database attributes on users and reviews', async () => {
  const fullAuthor = { ...authorRow, bio: 'Puzzle fan' }
  seed(ok({ user_id: 42 }), ok([{ following_id: 7 }]), ok([fullAuthor]))
  assert.deepEqual(await request(), { status: 200, body: { following: [fullAuthor] } })

  const fullReview = { review_id: 3, user_id: 7, game_name: 'Portal 2', score: 9, review: 'Great puzzles.', created_at: '2026-11-25T18:00:00Z', contains_spoilers: false }
  seed(ok({ user_id: 42 }), ok([{ following_id: 7 }]), ok([fullAuthor]), ok([fullReview]))
  assert.deepEqual(await request('/reviews'), {
    status: 200, body: { reviews: [fullReview] },
  })
})

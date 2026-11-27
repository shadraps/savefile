import assert from 'node:assert/strict'
import { once } from 'node:events'
import { after, before, mock, test } from 'node:test'
import express from 'express'

let results = []
let queries = []

mock.module('../src/supabase.ts', {
  namedExports: { supabase: { from(table) {
    const query = { table, calls: [] }
    queries.push(query)
    const builder = { then(resolve, reject) {
      assert.ok(results.length, `Unexpected query to ${table}`)
      return Promise.resolve(results.shift()).then(resolve, reject)
    } }
    for (const method of ['select', 'eq', 'order', 'maybeSingle']) {
      builder[method] = (...args) => { query.calls.push([method, ...args]); return builder }
    }
    return builder
  } } },
})

const { default: router } = await import('../src/routes/users.ts')
const app = express()
app.use('/api/users', router)
let server
let baseUrl
before(async () => {
  server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  baseUrl = `http://127.0.0.1:${server.address().port}/api/users`
})
after(() => new Promise((resolve) => server.close(resolve)))

const user = { user_id: 7, username: 'alex', display_name: 'Alex' }
const review = { review_id: 3, user_id: 7, game_name: 'Portal 2', score: 9, review: 'Great puzzles.' }
const ok = (data, count = null) => ({ data, count, error: null })
function seed(...responses) { queries = []; results = responses }
async function request() {
  const response = await fetch(`${baseUrl}/alex`)
  return { status: response.status, body: await response.json() }
}

test('uses the URL username without a GET body and returns the profile, reviews, and directed follow counts', async () => {
  seed(ok(user), ok([review]), ok(null, 2), ok(null, 5))
  assert.deepEqual(await request(), {
    status: 200, body: { user, reviews: [review], followingCount: 2, followerCount: 5 },
  })
  assert.deepEqual(queries, [
    { table: 'users', calls: [['select', '*'], ['eq', 'username', 'alex'], ['maybeSingle']] },
    { table: 'reviews', calls: [
      ['select', '*'], ['eq', 'user_id', 7],
      ['order', 'created_at', { ascending: false }], ['order', 'review_id', { ascending: false }],
    ] },
    { table: 'follows', calls: [['select', '*', { count: 'exact', head: true }], ['eq', 'follower_id', 7]] },
    { table: 'follows', calls: [['select', '*', { count: 'exact', head: true }], ['eq', 'following_id', 7]] },
  ])
})

test('returns empty reviews and zero counts for a new user', async () => {
  seed(ok(user), ok([]), ok(null, 0), ok(null, 0))
  assert.deepEqual(await request(), {
    status: 200, body: { user, reviews: [], followingCount: 0, followerCount: 0 },
  })
})

test('returns 404 for a missing username without querying reviews or counts', async () => {
  seed(ok(null))
  assert.deepEqual(await request(), { status: 404, body: { error: 'User not found' } })
  assert.equal(queries.length, 1)
})

for (let stage = 0; stage < 4; stage++) {
  test(`returns a database error from query ${stage + 1} instead of a partial profile`, async () => {
    const responses = [ok(user), ok([review]), ok(null, 2), ok(null, 5)]
    responses[stage] = { data: null, error: { message: 'Database unavailable' } }
    seed(...responses)
    assert.deepEqual(await request(), { status: 500, body: { error: 'Database unavailable' } })
    assert.equal(queries.length, stage === 0 ? 1 : 4)
  })
}

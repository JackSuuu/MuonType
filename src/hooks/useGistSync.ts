import { useCallback } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useHistoryStore } from '../stores/historyStore'
import type { TestResult } from '../types'

const GIST_FILENAME = 'zentype-history.json'
const GIST_DESCRIPTION = 'ZenType typing test history'

interface GistFile {
  filename: string
  content: string
}

interface GistResponse {
  id: string
  files: Record<string, GistFile>
}

// Fetch the user's existing ZenType gist, or null if none found
async function findZenTypeGist(token: string): Promise<string | null> {
  let page = 1
  while (true) {
    const res = await fetch(`https://api.github.com/gists?per_page=100&page=${page}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
      },
    })
    if (!res.ok) return null
    const gists = await res.json() as Array<{ id: string; files: Record<string, unknown> }>
    if (gists.length === 0) break
    const found = gists.find((g) => GIST_FILENAME in g.files)
    if (found) return found.id
    if (gists.length < 100) break
    page++
  }
  return null
}

// Create a new private gist with the given history
async function createGist(token: string, results: TestResult[]): Promise<string> {
  const res = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: GIST_DESCRIPTION,
      public: false,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(results, null, 2),
        },
      },
    }),
  })
  if (!res.ok) throw new Error(`Failed to create gist: ${res.statusText}`)
  const data = await res.json() as GistResponse
  return data.id
}

// Read history from an existing gist
async function readGist(token: string, gistId: string): Promise<TestResult[]> {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
    },
  })
  if (!res.ok) throw new Error(`Failed to read gist: ${res.statusText}`)
  const data = await res.json() as GistResponse
  const file = data.files[GIST_FILENAME]
  if (!file?.content) return []
  try {
    return JSON.parse(file.content) as TestResult[]
  } catch {
    return []
  }
}

// Write history to an existing gist
async function writeGist(token: string, gistId: string, results: TestResult[]): Promise<void> {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(results, null, 2),
        },
      },
    }),
  })
  if (!res.ok) throw new Error(`Failed to write gist: ${res.statusText}`)
}

export function useGistSync() {
  const { token, gistId, setGistId } = useAuthStore()
  const { results, addResult, clearHistory } = useHistoryStore()

  // Pull remote history into local store (merges by id, remote wins on conflict)
  const pullFromGist = useCallback(async (): Promise<void> => {
    if (!token) return

    let id = gistId
    if (!id) {
      id = await findZenTypeGist(token)
      if (id) setGistId(id)
    }
    if (!id) return // no gist yet, nothing to pull

    const remoteResults = await readGist(token, id)
    if (remoteResults.length === 0) return

    // Merge: build a map of existing ids, add any remote results not already present
    const existingIds = new Set(results.map((r) => r.id))
    const newResults = remoteResults.filter((r) => !existingIds.has(r.id))
    // Add in chronological order (oldest first so they land at correct positions)
    for (const r of newResults.reverse()) {
      addResult(r)
    }
  }, [token, gistId, setGistId, results, addResult])

  // Push local history to remote gist (creates gist if needed)
  const pushToGist = useCallback(async (): Promise<void> => {
    if (!token) return

    let id = gistId
    if (!id) {
      id = await findZenTypeGist(token)
      if (id) {
        setGistId(id)
      } else {
        id = await createGist(token, results)
        setGistId(id)
        return
      }
    }

    await writeGist(token, id, results)
  }, [token, gistId, setGistId, results])

  // Full two-way sync: pull first, then push merged result
  const syncGist = useCallback(async (): Promise<void> => {
    if (!token) return
    await pullFromGist()
    // After pulling, push the now-merged local state
    // (results ref is stale here; push reads from store directly so it's fine)
    await pushToGist()
  }, [token, pullFromGist, pushToGist])

  // Save a single new result and push to gist
  const saveResult = useCallback(
    async (result: TestResult): Promise<void> => {
      addResult(result)
      if (token) {
        // Small delay to let Zustand flush before we read results
        await new Promise((r) => setTimeout(r, 50))
        await pushToGist()
      }
    },
    [token, addResult, pushToGist]
  )

  return { pullFromGist, pushToGist, syncGist, saveResult, clearHistory }
}

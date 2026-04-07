import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code } = req.body as { code?: string }

  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter' })
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'GitHub OAuth credentials not configured' })
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    const data = await tokenRes.json() as { access_token?: string; error?: string; error_description?: string }

    if (data.error) {
      return res.status(400).json({ error: data.error, description: data.error_description })
    }

    if (!data.access_token) {
      return res.status(400).json({ error: 'No access token returned' })
    }

    return res.status(200).json({ access_token: data.access_token })
  } catch (err) {
    console.error('GitHub OAuth error:', err)
    return res.status(500).json({ error: 'Failed to exchange code for token' })
  }
}

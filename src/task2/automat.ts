import { writeFile } from 'fs/promises';
export async function getToken(
    authority: string,
    audience: string,
    clientId: string,
    clientSecret: string,
    scope: string
): Promise<string>{
    const response = await fetch(`${authority}/oauth/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            audience,
            scope
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to get token: ${response.statusText}`);
    }

    const data = await response.json();

    return data.access_token;
}

export async function issuePass(
  url: string,
  token: string,
  name: string,
  document: string
): Promise<void> {
  const response = await fetch(`${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name,
      document
    })
  });

  if (response.status !== 201) {
    throw new Error(`Failed to issue pass: ${response.statusText}`);
  }

  const location = response.headers.get('Location');
  if (!location) {
    throw new Error('No Location header in response');
  }
  const id = location.split('/').pop();
  if (!id) {
    throw new Error('No ID found in Location header');
  }

  const png = Buffer.from(await response.arrayBuffer());
  await writeFile(`${id}.png`, png);
}
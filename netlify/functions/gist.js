exports.handler = async (event) => {
  const GIST_TOKEN = process.env.GIST_TOKEN;
  const GIST_ID    = '5032ea8bc1d1a251ff47fc1699f3b98f';
  const GIST_FILE  = 'kou-goal.json';
  const GIST_URL   = 'https://api.github.com/gists/' + GIST_ID;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Content-Type': 'application/json'
  };

  // OPTIONSプリフライト対応
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Gistからデータ読み込み
      const res = await fetch(GIST_URL, {
        headers: {
          'Authorization': 'Bearer ' + GIST_TOKEN,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
      if (!res.ok) throw new Error('GitHub API error: ' + res.status);
      const gist = await res.json();
      const content = gist.files[GIST_FILE]?.content || '{}';
      return { statusCode: 200, headers, body: content };

    } else if (event.httpMethod === 'PATCH') {
      // Gistにデータ保存
      const data = JSON.parse(event.body);
      const res = await fetch(GIST_URL, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + GIST_TOKEN,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: { [GIST_FILE]: { content: JSON.stringify(data) } }
        })
      });
      if (!res.ok) throw new Error('GitHub API error: ' + res.status);
      return { statusCode: 200, headers, body: '{"ok":true}' };

    } else {
      return { statusCode: 405, headers, body: '{"error":"Method not allowed"}' };
    }
  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};

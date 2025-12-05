export async function postView(userId: string, videoFileName: string) {
  const res = await fetch('/api/history/view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, videoFileName }),
  });
  if (!res.ok) throw new Error('Failed to record view');
  return res.json();
}

export async function fetchHistory(userId: string) {
  const res = await fetch(`/api/history/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

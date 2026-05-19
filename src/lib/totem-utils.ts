export async function getActiveComandaId(clienteId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/comandas/totem/${clienteId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.id;
  } catch {
    return null;
  }
}

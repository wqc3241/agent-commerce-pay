export interface GeminiContent {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

export type GeminiPart =
  | { text: string }
  | { functionCall: { name: string; args: Record<string, unknown> } }
  | { functionResponse: { name: string; response: Record<string, unknown> } }

export interface GeminiFunctionDeclaration {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface GeminiResponse {
  candidates: {
    content: GeminiContent
    finishReason: string
  }[]
}

export type GeminiToolConfig = {
  functionDeclarations: GeminiFunctionDeclaration[]
}

export function isAIAvailable(): boolean {
  return !!(
    import.meta.env.VITE_GEMINI_API_KEY &&
    import.meta.env.VITE_TAVILY_API_KEY
  )
}

export async function sendMessage(
  contents: GeminiContent[],
  systemPrompt: string,
  tools: GeminiToolConfig[]
): Promise<GeminiResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not configured')

  const response = await fetch(
    `/api/gemini/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        tools,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error (${response.status}): ${error}`)
  }

  return response.json()
}

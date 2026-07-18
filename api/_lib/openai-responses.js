export function extractOpenAiResponseText(result) {
  if (result?.status === 'incomplete') {
    throw new Error('OpenAI returned an incomplete response.')
  }

  const content = Array.isArray(result?.output)
    ? result.output
        .filter((item) => item?.type === 'message' && Array.isArray(item.content))
        .flatMap((item) => item.content)
    : []

  if (content.some((item) => item?.type === 'refusal')) {
    throw new Error('OpenAI refused the image-analysis request.')
  }

  const nestedText = content.find(
    (item) => item?.type === 'output_text' && typeof item.text === 'string',
  )?.text

  if (typeof nestedText === 'string' && nestedText.trim()) return nestedText
  return typeof result?.output_text === 'string' ? result.output_text : ''
}

export function openAiReasoningConfig(model) {
  return /^gpt-5(?:[.-]|$)/i.test(model)
    ? { reasoning: { effort: 'none' } }
    : {}
}

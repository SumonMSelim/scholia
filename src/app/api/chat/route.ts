import {convertToModelMessages, stepCountIs, streamText, type UIMessage} from 'ai'
import {z} from 'zod'
import {agentModel} from '@/lib/agent/models'
import {contextMcp} from '@/lib/agent/context-mcp'
import {MODES, MODE_PROMPTS, type Mode} from '@/lib/agent/prompts'
import {examPlan, lookupSource, saveWebReference, weakTopics, webSearch} from '@/lib/agent/tools'
import {finalAnswerStep, MAX_STEPS} from '@/lib/agent/steps'
import {readClient} from '@/lib/sanity/client'

export const maxDuration = 120

const Body = z.object({
  messages: z.array(z.custom<UIMessage>()),
  mode: z.enum(MODES),
  courseId: z.string().min(1),
})

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) return Response.json({error: parsed.error.flatten()}, {status: 400})
  const {messages, mode, courseId} = parsed.data

  const course = await readClient.fetch<{title: string; code: string; contextEndpoint?: string} | null>(
    `*[_type=="course" && _id==$id][0]{title, code, contextEndpoint}`,
    {id: courseId},
  )
  if (!course) return Response.json({error: 'Unknown course'}, {status: 404})

  const mcp = await contextMcp(course.contextEndpoint)
  const kbTools = await mcp.tools()

  const result = streamText({
    model: agentModel(),
    system: MODE_PROMPTS[mode as Mode](`${course.code} ${course.title}`),
    messages: await convertToModelMessages(messages),
    tools: {
      ...kbTools,
      lookup_source: lookupSource(courseId),
      weak_topics: weakTopics(courseId),
      exam_plan: examPlan(courseId),
      web_search: webSearch(),
      save_web_reference: saveWebReference(courseId),
    },
    stopWhen: stepCountIs(MAX_STEPS),
    prepareStep: finalAnswerStep,
    onFinish: async () => {
      await mcp.close()
    },
    onError: async ({error}) => {
      console.error('chat error', error)
      await mcp.close()
    },
  })

  return result.toUIMessageStreamResponse()
}

// supabase/functions/sync-notion/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const NOTION_TOKEN = Deno.env.get('NOTION_TOKEN')!
const NOTION_DB_ID = Deno.env.get('NOTION_DB_ID')!
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

function getSelect(prop: any): string | null {
  return prop?.select?.name ?? null
}

function getStatus(prop: any): string | null {
  return prop?.status?.name ?? null
}

Deno.serve(async () => {
  let allResults: any[] = []
  let cursor: string | undefined = undefined

  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cursor ? { start_cursor: cursor } : {}),
    })
    const data = await res.json()
    allResults = allResults.concat(data.results)
    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor)

  const rows = allResults.map((page: any) => {
    const props = page.properties
    return {
      notion_id: page.id,
      nom: props.nom?.title?.[0]?.plain_text ?? '',
      alcool: getSelect(props.alcool),
      hebergement: getSelect(props.hebergement),
      groupe: getSelect(props.groupe),
      age: getStatus(props.age),
      rsvp: getSelect(props.rsvp),
      updated_at: page.last_edited_time,
    }
  })

  const { error } = await supabase
    .from('guests')
    .upsert(rows, { onConflict: 'notion_id' })

  if (error) return new Response(JSON.stringify(error), { status: 500 })
  return new Response(JSON.stringify({ synced: rows.length }), { status: 200 })
})
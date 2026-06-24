import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle2, XCircle, Clock, AlertCircle, History } from 'lucide-react'
import VisitHistoryClient from './VisitHistoryClient'

export default async function ResidentHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: resident } = await supabase.from('residents').select('id').eq('user_id', user.id).single()

  const { data: visits } = resident
    ? await supabase
        .from('visit_requests')
        .select('id, visitor_name, visit_code, visit_date, visit_time, purpose, status, request_date')
        .eq('resident_id', resident.id)
        .order('request_date', { ascending: false })
    : { data: [] }

  return <VisitHistoryClient visits={visits ?? []} />
}

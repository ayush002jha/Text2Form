import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export default async function DashboardIndex() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch all forms created by this user
  const { data: forms } = await supabase
    .from('forms')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-white/80 font-bold text-lg group-hover:text-white transition-colors">
            Text2Form<span className="text-violet-400">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-white/60 text-sm hidden sm:block">{user.email}</div>
          <form action="/auth/signout" method="post">
            <button className="text-sm bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition-colors">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 pb-20 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Forms</h1>
            <p className="text-white/40">Manage your created forms and view private analytics.</p>
          </div>
          <Link href="/" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/25 transition-all">
            + New Form
          </Link>
        </div>

        {!forms || forms.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No forms yet</h3>
            <p className="text-white/40 mb-6 text-sm">Create your first AI-generated form to see it here.</p>
            <Link href="/" className="text-violet-400 hover:text-violet-300 text-sm font-medium">Get Started →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card key={form.id} className="bg-white/[0.03] border-white/10 hover:border-violet-500/30 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white line-clamp-1">{form.title}</h3>
                    <div className="p-1.5 rounded-md bg-white/5 text-white/40 group-hover:text-violet-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-white/40 text-sm line-clamp-2 mb-6 h-10">
                    {form.description || "No description provided."}
                  </p>
                  <div className="flex items-center justify-between text-xs text-white/30 mb-6">
                    <span>{new Date(form.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-3">
                    <Link href={`/dashboard/${form.id}`} className="flex-1 text-center bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 py-2 rounded-lg text-sm font-medium transition-colors">
                      Dashboard
                    </Link>
                    <Link href={`/f/${form.id}`} target="_blank" className="flex-1 text-center bg-white/5 hover:bg-white/10 text-white/70 py-2 rounded-lg text-sm font-medium transition-colors">
                      View Form
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

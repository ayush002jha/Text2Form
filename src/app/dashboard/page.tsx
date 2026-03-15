import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import DeleteFormButton from '@/components/DeleteFormButton';

export default async function DashboardIndex() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch all forms created by this user with submission counts
  const { data: forms } = await supabase
    .from('forms')
    .select('*, submissions(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen relative pb-20">

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-16 gap-6">
          <div className="relative">
            <h1 className="text-5xl lg:text-7xl font-pixel font-bold text-foreground mb-4 uppercase tracking-tighter drop-shadow-[5px_5px_0_rgba(0,0,0,0.08)]">
              My Vault
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-2 w-12 bg-primary border-2 border-border" />
              <p className="text-muted-foreground font-pixel text-lg uppercase tracking-widest">
                {forms?.length || 0} Managed Assets
              </p>
            </div>
          </div>
          <Link href="/" className="group relative">
            <div className="absolute inset-0 bg-border translate-x-2 translate-y-2 group-active:translate-x-0 group-active:translate-y-0 transition-all" />
            <div className="relative bg-primary text-primary-foreground border-4 border-border px-8 py-4 font-pixel text-2xl uppercase tracking-widest flex items-center gap-3 -translate-x-1 -translate-y-1 group-hover:-translate-x-2 group-hover:-translate-y-2 group-active:translate-x-0 group-active:translate-y-0 transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              New Form
            </div>
          </Link>
        </div>

        {!forms || forms.length === 0 ? (
          <div className="text-center py-24 bg-card border-4 border-border shadow-[12px_12px_0px_var(--border)] max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 13h-2V7h2v6zm0 4h-2v-2h2v2zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
            </div>
            <div className="w-24 h-24 mx-auto mb-8 bg-secondary border-4 border-border shadow-retro flex items-center justify-center text-secondary-foreground rotate-3">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-pixel text-4xl text-foreground mb-4 uppercase tracking-widest">Database Empty</h3>
            <p className="text-muted-foreground mb-10 font-bold text-lg uppercase tracking-wide">No forms detected in your neural network.</p>
            <Link href="/" className="inline-block bg-accent text-accent-foreground border-4 border-border shadow-retro hover:shadow-retro-hover active:shadow-retro-active px-10 py-4 font-pixel text-2xl uppercase transition-all">
              Initialize Sequence →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {forms.map((form) => {
              const submissionCount = (form.submissions as any)?.[0]?.count || 0;
              return (
                <div key={form.id} className="group relative">
                  {/* Background shadow layer */}
                  <div className="absolute inset-0 bg-border/5 translate-x-3 translate-y-3 transition-transform duration-300 group-hover:translate-x-4 group-hover:translate-y-4" />
                  
                  {/* Main card body */}
                  <div className="relative bg-card border-4 border-border h-full flex flex-col transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                    
                    {/* Header: Identity & Type */}
                    <div className="p-5 border-b-4 border-border bg-background flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className={`font-pixel text-xs px-2 py-1 border-2 border-border shadow-[2px_2px_0_var(--border)] uppercase ${form.is_quiz ? 'bg-secondary text-secondary-foreground' : 'bg-accent text-accent-foreground'}`}>
                          {form.is_quiz ? 'QUIZ_MODE' : 'FORM_DATA'}
                        </span>
                        <div className="flex gap-1">
                          {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-border rounded-full opacity-30" />)}
                        </div>
                      </div>
                      <h3 className="font-pixel text-2xl text-foreground uppercase tracking-wider line-clamp-1 h-8">
                        {form.title}
                      </h3>
                    </div>

                    {/* Stats Section */}
                    <div className="p-5 flex-1 flex flex-col">
                      <p className="text-muted-foreground font-sans font-medium text-sm line-clamp-2 min-h-10 mb-6 group-hover:text-foreground transition-colors">
                        {form.description || "System generated context for dynamic form deployment."}
                      </p>

                      <div className="mt-auto grid grid-cols-2 gap-4 border-t-4 border-border border-dashed pt-5">
                        <div className="flex flex-col gap-1">
                          <span className="font-pixel text-[10px] text-muted-foreground uppercase tracking-widest">Responses</span>
                          <div className="flex items-center gap-2 text-primary">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m12-16a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span className="font-pixel text-xl">{submissionCount}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-pixel text-[10px] text-muted-foreground uppercase tracking-widest">Identity</span>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-pixel text-sm">{new Date(form.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="p-3 bg-muted/40 border-t-4 border-border grid grid-cols-4 gap-2">
                      <Link 
                        href={`/dashboard/${form.id}`} 
                        className="flex items-center justify-center bg-secondary text-secondary-foreground border-2 border-border shadow-[2px_2px_0_var(--border)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_var(--border)] active:translate-y-0 active:shadow-none py-2 transition-all group/btn"
                        title="View Analytics"
                      >
                        <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </Link>
                      <Link 
                        href={`/dashboard/${form.id}/edit`} 
                        className="flex items-center justify-center bg-card text-foreground border-2 border-border shadow-[2px_2px_0_var(--border)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_var(--border)] active:translate-y-0 active:shadow-none py-2 transition-all group/btn"
                        title="Edit Form"
                      >
                        <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <Link 
                        href={`/f/${form.id}`} 
                        target="_blank" 
                        className="flex items-center justify-center bg-primary text-primary-foreground border-2 border-border shadow-[2px_2px_0_var(--border)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_var(--border)] active:translate-y-0 active:shadow-none py-2 transition-all group/btn"
                        title="View Public Link"
                      >
                        <svg className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      <DeleteFormButton formId={form.id} formTitle={form.title} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

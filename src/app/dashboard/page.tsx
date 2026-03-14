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
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Grid overlay */}
      <div
        className="absolute inset-[0] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--color-border) 2px, transparent 2px), linear-gradient(90deg, var(--color-border) 2px, transparent 2px)`,
          backgroundSize: "64px 64px",
          opacity: 0.08
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 pb-20 mt-8">
        <div className="flex items-center justify-between mb-12 border-b-4 border-border pb-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-pixel font-bold text-foreground mb-2 uppercase tracking-tight drop-shadow-[2px_2px_0_var(--color-border)]">My Forms</h1>
            <p className="text-muted-foreground font-sans font-medium">Manage your created forms and view private analytics.</p>
          </div>
          <Link href="/" className="bg-primary text-primary-foreground border-4 border-border shadow-retro hover:shadow-retro-hover active:shadow-retro-active px-6 py-3 font-pixel text-xl uppercase transition-all">
            + New Form
          </Link>
        </div>

        {!forms || forms.length === 0 ? (
          <div className="text-center py-20 bg-card border-4 border-border shadow-[8px_8px_0px_var(--border)] max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-secondary border-4 border-border shadow-retro flex items-center justify-center text-secondary-foreground">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-pixel text-3xl text-foreground mb-3 uppercase tracking-wider">No forms yet</h3>
            <p className="text-muted-foreground mb-8 font-medium">Create your first AI-generated form to see it here.</p>
            <Link href="/" className="inline-block bg-accent text-accent-foreground border-4 border-border shadow-retro hover:shadow-retro-hover active:shadow-retro-active px-8 py-3 font-pixel text-xl uppercase transition-all">
              Initialize →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {forms.map((form) => (
              <Card key={form.id} className="bg-card border-4 border-border rounded-none shadow-[4px_4px_0px_var(--border)] hover:shadow-[8px_8px_0px_var(--border)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 border-b-4 border-border bg-card">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-pixel text-2xl text-foreground uppercase tracking-widest line-clamp-1">{form.title}</h3>
                    </div>
                    <p className="text-muted-foreground font-medium text-sm line-clamp-2 h-10">
                      {form.description || "No description provided."}
                    </p>
                  </div>
                  <div className="p-6 bg-muted/30">
                    <div className="flex items-center justify-between font-pixel text-muted-foreground uppercase text-lg mb-6">
                      <span>{new Date(form.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-4">
                      <Link href={`/dashboard/${form.id}`} className="flex-1 text-center bg-secondary text-secondary-foreground border-4 border-border shadow-retro hover:shadow-retro-hover active:shadow-retro-active py-2 font-pixel text-xl uppercase transition-all">
                        Stats
                      </Link>
                      <Link href={`/f/${form.id}`} target="_blank" className="flex-1 text-center bg-primary text-primary-foreground border-4 border-border shadow-retro hover:shadow-retro-hover active:shadow-retro-active py-2 font-pixel text-xl uppercase transition-all">
                        View
                      </Link>
                    </div>
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

export default function AdminDashboard() {
  const cards = [
    { title: 'Total Staff', value: '24', subtitle: 'Active Nurse + Staff accounts' },
    { title: 'New This Month', value: '6', subtitle: 'Recently onboarded staff users' },
    { title: 'System Status', value: 'Secure', subtitle: 'Role-based access is active' },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Welcome to the admin panel. Use this space to monitor and manage platform staff access.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-2 text-sm text-slate-600">{card.subtitle}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Quick Action</h2>
        <p className="mt-2 text-sm text-slate-600">
          Open <span className="font-semibold">Manage Staff</span> from the sidebar to create Nurse and Staff accounts.
        </p>
      </section>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { IntegrationsPanel } from "@/components/IntegrationsPanel";

const WEBHOOK_PATHS: Record<string, string> = {
  FACEBOOK: "/api/webhooks/facebook",
  INSTAGRAM: "/api/webhooks/instagram",
  WHATSAPP: "/api/webhooks/whatsapp",
  LINKEDIN: "/api/webhooks/linkedin",
};

export default async function IntegrationsSettingsPage() {
  const integrations = await prisma.integrationSource.findMany({ orderBy: { channel: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Integrations</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Add a row per channel to track its status here. Webhook URLs and secrets/API keys are
        configured on the server via environment variables (see <code>.env.example</code>) — this
        panel only tracks which channels are enabled and when they last sent an event.
      </p>

      <div className="mt-4 grid gap-2 rounded-lg bg-slate-50 p-4 text-xs text-slate-500 sm:grid-cols-2">
        {Object.entries(WEBHOOK_PATHS).map(([channel, path]) => (
          <p key={channel}>
            <span className="font-medium text-slate-700">{channel}:</span> {path}
          </p>
        ))}
      </div>

      <div className="mt-6">
        <IntegrationsPanel
          initial={integrations.map((i) => ({
            id: i.id,
            channel: i.channel,
            label: i.label,
            isActive: i.isActive,
            lastEventAt: i.lastEventAt ? i.lastEventAt.toISOString() : null,
          }))}
        />
      </div>
    </div>
  );
}

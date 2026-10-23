import type { Lead, LeadSink } from '@/lib/leads/types';

/** Test-only sink (E2E_LEADS_SINK=memory): keeps leads in this process instead of emailing them. */
export const memoryLeads: Lead[] = [];

export const memorySink: LeadSink = {
  async deliver(lead) {
    memoryLeads.push(lead);
  },
};

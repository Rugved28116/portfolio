/** Opt in a semantic element without adding a client component or wrapper. */
export function maintenancePart(id: string, enabled = true) {
  return enabled ? { "data-maintenance-breakable": "", "data-maintenance-id": id } : {};
}

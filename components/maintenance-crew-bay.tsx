"use client";

import { useMaintenance } from "@/components/maintenance-provider";

import styles from "./maintenance-crew-bay.module.css";

export function MaintenanceCrewBay() {
  const { maintenanceCrewVisible } = useMaintenance();

  if (!maintenanceCrewVisible) return null;

  return (
    <aside
      className={styles.boundary}
      aria-hidden="true"
      data-maintenance-crew-bay
      data-maintenance-protected
    >
      <div className={styles.bay}>
        <span className={styles.label}>RGB / CREW BAY</span>
        <span className={styles.floor} />

        <div className={styles.bench}>
          <span className={styles.benchBack} />
          <span className={styles.benchSeat} />
          <span className={styles.benchLegLeft} />
          <span className={styles.benchLegRight} />
        </div>

        <div className={styles.crate}>
          <span className={styles.crateHandle} />
          <span className={styles.cratePanel} />
        </div>

        <div className={styles.console}>
          <span className={styles.consoleScreen} />
          <span className={styles.consoleSignal} />
          <span className={styles.consoleStand} />
        </div>

        <span className={styles.restSlot} data-maintenance-rest-slot="bench-left" data-rest-kind="bench" />
        <span className={styles.restSlot} data-maintenance-rest-slot="bench-right" data-rest-kind="bench" />
        <span className={`${styles.restSlot} ${styles.standingLeftSlot}`} data-maintenance-rest-slot="standing-left" data-rest-kind="bench" />
        <span className={styles.restSlot} data-maintenance-rest-slot="crate-side" data-rest-kind="crate" />
        <span className={`${styles.restSlot} ${styles.standingRightSlot}`} data-maintenance-rest-slot="standing-right" data-rest-kind="bench" />
        <span className={`${styles.restSlot} ${styles.consoleSlot}`} data-maintenance-rest-slot="console-side" data-rest-kind="console" />
      </div>
    </aside>
  );
}

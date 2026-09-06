import styles from "./not-found-scene.module.css";

function InspectorWorker() {
  return (
    <svg
      className={styles.workerGraphic}
      viewBox="0 0 54 66"
      focusable="false"
    >
      <g className={styles.inspectorHead}>
        <path className={styles.antenna} d="M25 3h4v8h-4z" />
        <path className={styles.antennaTip} d="M23 1h8v4h-8z" />
        <rect className={styles.shell} x="12" y="10" width="30" height="22" />
        <rect className={styles.panel} x="16" y="15" width="22" height="10" />
        <rect className={styles.visor} x="19" y="18" width="11" height="4" />
      </g>
      <rect className={styles.body} x="15" y="34" width="24" height="20" />
      <rect className={styles.chest} x="21" y="39" width="12" height="3" />
      <path className={styles.limb} d="M9 36h6v17H9zM39 36h6v17h-6z" />
      <path className={styles.limb} d="M17 53h8v11h-8zM30 53h8v11h-8z" />
      <path className={styles.tool} d="M43 43h8v3h-8zM48 40h3v10h-3z" />
      <path className={styles.inspectBeam} d="m39 22 10-4v8z" />
    </svg>
  );
}

function ClipboardWorker() {
  return (
    <svg
      className={styles.workerGraphic}
      viewBox="0 0 54 66"
      focusable="false"
    >
      <path className={styles.antenna} d="M25 3h4v8h-4z" />
      <path className={styles.antennaTip} d="M23 1h8v4h-8z" />
      <rect className={styles.shell} x="12" y="10" width="30" height="22" />
      <rect className={styles.panel} x="16" y="15" width="22" height="10" />
      <rect className={styles.visor} x="24" y="18" width="11" height="4" />
      <rect className={styles.body} x="15" y="34" width="24" height="20" />
      <rect className={styles.chest} x="21" y="39" width="12" height="3" />
      <path className={styles.limb} d="M9 36h6v17H9zM39 36h6v17h-6z" />
      <path className={styles.limb} d="M17 53h8v11h-8zM30 53h8v11h-8z" />
      <g className={styles.clipboardArm}>
        <rect className={styles.clipboard} x="2" y="39" width="13" height="17" />
        <path className={styles.clipboardLines} d="M5 45h7v2H5zM5 50h5v2H5z" />
        <rect className={styles.clip} x="6" y="36" width="6" height="5" />
      </g>
    </svg>
  );
}

export function NotFoundScene() {
  return (
    <div className={styles.scene} aria-hidden="true">
      <div className={styles.sceneLabel}>SEARCH / LOCAL INDEX</div>

      <div className={styles.missingFrame}>
        <span className={styles.frameCorners} />
        <span className={styles.frameTitle}>COMPONENT MISSING</span>
        <span className={styles.frameStatus}>STATUS / UNRESOLVED</span>
      </div>

      <div className={styles.speech}>checking logs</div>
      <div className={`${styles.worker} ${styles.inspector}`}>
        <InspectorWorker />
      </div>
      <div className={`${styles.worker} ${styles.recorder}`}>
        <ClipboardWorker />
      </div>

      <div className={styles.baseline} />
    </div>
  );
}

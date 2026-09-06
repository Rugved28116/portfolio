import { maintenancePart } from "@/lib/maintenance-parts";

/** Inline spans retain normal text shaping; only damaged characters become transformable. */
export function MaintenanceCharacters({ text, id }: { text: string; id: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {Array.from(text).map((character, index) => /\s/.test(character) ? character : (
          <span key={`${id}-${index}`} {...maintenancePart(`${id}-char-${index}`)} data-maintenance-character>
            {character}
          </span>
        ))}
      </span>
    </>
  );
}

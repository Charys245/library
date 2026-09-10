const mois = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sept",
  "Oct",
  "Nov",
  "Déc",
] as const;

export function formaterDate(value: string | Date): string {
  // Cas d'une date déjà représentée par un objet Date
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "";
    }

    return formaterDateComplete(
      value.getDate(),
      value.getMonth(),
      value.getFullYear(),
      value.getHours(),
      value.getMinutes()
    );
  }

  // Date seule : YYYY-MM-DD
  // On la traite manuellement pour éviter les décalages de fuseau horaire.
  const dateSeule = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (dateSeule) {
    const [, annee, moisNumerique, jour] = dateSeule;

    return `${Number(jour)} ${mois[Number(moisNumerique) - 1]} ${annee}`;
  }

  // Date avec heure : YYYY-MM-DDTHH:mm:ss...
  const dateAvecHeure = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);

  if (dateAvecHeure) {
    const [, annee, moisNumerique, jour, heures, minutes] = dateAvecHeure;

    return (
      `${Number(jour)} ${mois[Number(moisNumerique) - 1]} ${annee} ` +
      `à ${heures}:${minutes}`
    );
  }

  return "";
}

function formaterDateComplete(
  jour: number,
  moisIndex: number,
  annee: number,
  heures: number,
  minutes: number
): string {
  const jourFormate = String(jour);
  const heuresFormatees = String(heures).padStart(2, "0");
  const minutesFormatees = String(minutes).padStart(2, "0");

  return (
    `${jourFormate} ${mois[moisIndex]} ${annee} ` +
    `à ${heuresFormatees}:${minutesFormatees}`
  );
}

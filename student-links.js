export const cleanName = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
export const cleanRa = value => String(value ?? '').replace(/\D/g, '').replace(/^0+(?=\d)/, '');
export function photoValue(raw) {
  return String(raw.photoUrl || raw.fotoUrl || raw.foto || raw.photo || '').trim();
}
export function sameStudent(record, student) {
  if (record.studentId && record.studentId === student.id) return true;
  const ra = cleanRa(record.studentRa || record.ra || record.RA);
  const base = cleanRa(student.ra), full = base + cleanRa(student.digit);
  // A conflicting RA must never fall back to a namesake.
  if (ra && base) return ra === base || ra === full;
  return cleanName(record.studentName || record.name || record.nome) === cleanName(student.name || student.nome)
    && String(record.classId || '').toUpperCase() === String(student.classId || '').toUpperCase();
}
export async function studentOccurrences(db, api, student) {
  const { getDocs, query, collection, where } = api;
  const requests = new Map();
  const add = (field, value) => { if(value) requests.set(field + '|' + value, [field, value]); };
  add('studentId', student.id);
  const base = cleanRa(student.ra), full = base + cleanRa(student.digit);
  for (const ra of new Set([String(student.ra || ''), base, full, student.digit ? `${student.ra}-${student.digit}` : ''])) add('studentRa', ra);
  add('studentName', student.name || student.nome);
  // Also discovers legacy formatting of names and RAs in the current class.
  add('classId', student.classId);
  const snapshots = await Promise.all([...requests.values()].map(([field,value]) => getDocs(query(collection(db,'occurrences'),where(field,'==',value)))));
  const documents = new Map();
  snapshots.forEach(snapshot => snapshot.docs.forEach(entry => {
    if (sameStudent(entry.data(),student)) documents.set(entry.id,entry);
  }));
  return [...documents.values()];
}
export function academicStudent(data, student) {
  if (!data) return null;
  const rows = Object.values(data), ra = cleanRa(student.ra);
  if (ra) {
    const matches = rows.filter(row => cleanRa(row.ra || row.RA) === ra);
    if (matches.length === 1) return matches[0];
  }
  const name = cleanName(student.name || student.nome);
  const matches = rows.filter(row => name && cleanName(row.nome || row.name) === name
    && (!ra || !cleanRa(row.ra || row.RA) || cleanRa(row.ra || row.RA) === ra));
  if (matches.length === 1) return matches[0];
  const number = String(student.number ?? student.numero ?? '').trim();
  const sameNumber = matches.filter(row => String(row.numero ?? row.number ?? '').trim() === number);
  if (sameNumber.length === 1) return sameNumber[0];
  const candidate = data[number] || rows.find(row => String(row.numero ?? row.number ?? '').trim() === number);
  // Number alone is safe only when the academic record has no identity to contradict it.
  if (candidate && !cleanName(candidate.nome || candidate.name) && !cleanRa(candidate.ra || candidate.RA)) return candidate;
  return null;
}
export function findPhoto(rows, student) {
  const withPhotos = rows.filter(row => photoValue(row));
  const base = cleanRa(student.ra), full = base + cleanRa(student.digit);
  const byRa = withPhotos.filter(row => {
    const other = cleanRa(row.ra || row.RA), otherFull = other + cleanRa(row.digit || row.digito);
    return base && other && (full === otherFull || base === other || full === other || base === otherFull);
  });
  if (byRa.length && new Set(byRa.map(photoValue)).size === 1) return photoValue(byRa[0]);
  if (byRa.length) return photoValue(student);
  const byName = withPhotos.filter(row => cleanName(row.name || row.nome) === cleanName(student.name)
    && String(row.classId || row.sala || row.Sala || '').trim().toUpperCase() === String(student.classId || '').trim().toUpperCase()
    && !(base && cleanRa(row.ra || row.RA)));
  return byName.length === 1 ? photoValue(byName[0]) : photoValue(student);
}

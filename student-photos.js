import { findPhoto, photoValue } from './student-links.js?v=20261014-5';
import { studentsPhotoSyncUrl } from './firebase-config.js?v=20261014-5';
import { fotosComplementares } from './fotos-complementares.js?v=20261014-5';

export function completeLocalPhotos(students) {
  return students.map(student => photoValue(student) ? student : {
    ...student, photoUrl:findPhoto(fotosComplementares, student)
  });
}

let catalogRequest = null;
let expiresAt = 0;
export function photoRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') throw new Error('Catálogo de fotos inválido');
  for (const key of ['alunos', 'students', 'data', 'dados', 'records']) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  const array = Object.values(payload).find(Array.isArray);
  if (array) return array;
  // Some deployments return students indexed by RA instead of an array.
  const rows = Object.values(payload);
  if (rows.length && rows.every(row => row && typeof row === 'object' && !Array.isArray(row))) return rows;
  throw new Error('Resposta do catálogo não contém alunos');
}
export function loadPhotoCatalog({fresh = false} = {}) {
  if (!fresh && catalogRequest && Date.now() < expiresAt) return catalogRequest;
  expiresAt = Date.now() + 60000;
  const url = new URL(studentsPhotoSyncUrl);
  url.searchParams.set('t', String(Date.now()));
  catalogRequest = (async () => {
    const response = await fetch(url.href, {cache:'no-store', redirect:'follow', signal:AbortSignal.timeout(12000)});
    if (!response.ok) throw new Error('Catálogo de fotos: HTTP ' + response.status);
    return photoRows(await response.json());
  })();
  catalogRequest.catch(() => { expiresAt = 0; });
  return catalogRequest;
}
export async function completeStudentPhotos(students) {
  students = completeLocalPhotos(students);
  if (!students.some(student => !photoValue(student))) return students;
  try {
    const rows = await loadPhotoCatalog();
    return students.map(student => photoValue(student) ? student : {...student, photoUrl:findPhoto(rows, student)});
  } catch (error) {
    // Failure of the photo service must not hide students, grades or occurrences.
    console.warn('Não foi possível completar as fotos pelo Apps Script:', error);
    return students;
  }
}

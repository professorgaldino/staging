import { driveApiKey, drivePhotosFolderId } from './drive-config.js?v=20261014-5';

const folderType = 'application/vnd.google-apps.folder';
const normalizeRa = value => String(value ?? '').toUpperCase().replace(/[^0-9X]/g,'').replace(/^0+(?=[0-9X])/,'');
export function photoFromFile(file, classId='') {
  if (!file.mimeType?.startsWith('image/')) return null;
  const match = String(file.name || '').replace(/\.[^/.]+$/,'').match(/^\s*(?:RA\s*[:_-]?\s*)?([0-9][0-9.\s]*[0-9Xx])\s*[-_–—]\s*(.+)$/);
  if (!match || !file.id) return null;
  const fullRa = match[1].replace(/[^0-9X]/gi,'').toUpperCase();
  return {ra:fullRa,nome:match[2].trim(),classId,foto:file.id,fileId:file.id,resourceKey:file.resourceKey || ''};
}
export function matchDrivePhoto(rows, student) {
  const base=normalizeRa(student.ra), digit=normalizeRa(student.digit ?? student.digito);
  if (!base) return {status:'missing',photo:''};
  const full=base+digit;
  let matches=rows.filter(row=>normalizeRa(row.ra)===full);
  if (!matches.length) matches=rows.filter(row=>normalizeRa(row.ra)===base);
  const ids=new Set(matches.map(row=>row.fileId));
  if (!ids.size) return {status:'missing',photo:''};
  if (ids.size>1) return {status:'ambiguous',photo:''};
  const row=matches[0];
  return {status:'matched',photo:row.resourceKey
    ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(row.fileId)}&resourcekey=${encodeURIComponent(row.resourceKey)}&sz=w600`
    : `https://lh3.googleusercontent.com/d/${row.fileId}=w600`};
}
export function planPhotoUpdates(rows, students) {
  const result={updates:[],matched:0,unchanged:0,missing:0,ambiguous:0};
  for (const student of students) {
    const match=matchDrivePhoto(rows,student);
    if (match.status!=='matched') {result[match.status]++;continue;}
    result.matched++;
    const old=String(student.photoUrl || student.fotoUrl || student.foto || student.photo || '');
    const oldId=old.match(/(?:\/d\/|id=)([-\w]{15,})/)?.[1] || (/^[-\w]{15,}$/.test(old)?old:'');
    const newId=match.photo.match(/(?:\/d\/|id=)([-\w]{15,})/)?.[1];
    if (old===match.photo || (oldId && oldId===newId)) result.unchanged++;
    else result.updates.push({student,photoUrl:match.photo});
  }
  return result;
}
async function listFolder(id, resourceKey='') {
  const files=[];let token='';
  do {
    const url=new URL('https://www.googleapis.com/drive/v3/files');
    url.search=new URLSearchParams({key:driveApiKey,q:`'${id}' in parents and trashed = false`,pageSize:'1000',fields:'nextPageToken,incompleteSearch,files(id,name,mimeType,resourceKey)',spaces:'drive',...(token?{pageToken:token}:{})});
    let response;
    for(let attempt=0;attempt<3;attempt++){
      response=await fetch(url.href,{cache:'no-store',signal:AbortSignal.timeout(30000),...(resourceKey?{headers:{'X-Goog-Drive-Resource-Keys':`${id}/${resourceKey}`}}:{})});
      if(response.status!==429 && response.status<500)break;
      if(attempt<2)await new Promise(resolve=>setTimeout(resolve,500*2**attempt));
    }
    if(!response.ok){
      const detail=await response.json().catch(()=>({}));
      const reason=detail.error?.errors?.[0]?.reason || '';
      throw new Error(`Drive: HTTP ${response.status}${reason?' ('+reason+')':''}. Verifique a chave, a restrição do site e o acesso à pasta.`);
    }
    const data=await response.json();
    if(!Array.isArray(data.files) || data.incompleteSearch)throw new Error('O Drive retornou uma lista incompleta. Nenhuma atualização foi iniciada.');
    files.push(...data.files);token=data.nextPageToken || '';
  }while(token);
  return files;
}
export async function loadDrivePhotos({onProgress=()=>{}}={}) {
  if(!driveApiKey)throw new Error('Configure a chave da Google Drive API.');
  const pending=[{id:drivePhotosFolderId,classId:'',resourceKey:''}],visited=new Set(),photos=[];
  while(pending.length){
    const folder=pending.shift();if(visited.has(folder.id))continue;visited.add(folder.id);
    onProgress(`Lendo fotos ${folder.classId || 'da pasta principal'} (${visited.size} pastas)`);
    const files=await listFolder(folder.id,folder.resourceKey);
    for(const file of files){
      if(file.mimeType===folderType){
        const name=String(file.name||'').trim().toUpperCase().replace(/\s+/g,'');
        pending.push({id:file.id,classId:/^\d+[A-Z]$/.test(name)?name:folder.classId,resourceKey:file.resourceKey||''});
      }else{const photo=photoFromFile(file,folder.classId);if(photo)photos.push(photo);}
    }
  }
  return photos;
}

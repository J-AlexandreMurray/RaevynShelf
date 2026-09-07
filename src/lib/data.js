import { supabase } from './supabase';
const KEY='raevynshelf_mvp_books';
export const localBooks=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
export const stats=(books)=>{const read=books.filter(b=>b.status==='read');const ratings=books.map(b=>Number(b.rating)).filter(Boolean);const words=books.reduce((n,b)=>n+(Number(b.word_count)||0),0);const tags={};books.forEach(b=>(b.tags||'').split(',').map(x=>x.trim()).filter(Boolean).forEach(t=>tags[t]=(tags[t]||0)+1));return{totalWorks:books.length,worksRead:read.length,totalWords:words,averageRating:ratings.length?(ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(2):'0.00',topTags:Object.entries(tags).sort((a,b)=>b[1]-a[1]).slice(0,5)}};
export async function loadWorks(uid){if(!supabase)return localBooks();const {data,error}=await supabase.from('works').select('id,ao3_work_id,ao3_url,title,author,status,rating,ao3_rating,word_count,language,completed_at,created_at,work_tags(tag)').eq('user_id',uid).order('created_at',{ascending:false});if(error)throw error;return(data||[]).map(w=>({...w,tags:(w.work_tags||[]).map(t=>t.tag).join(', '),dateFinished:w.completed_at}));}
export async function addWork(uid,w){if(!supabase){const x={...w,id:crypto.randomUUID(),dateFinished:w.status==='read'?new Date().toISOString():null};const next=[x,...localBooks().filter(item=>!w.ao3_work_id||item.ao3_work_id!==w.ao3_work_id)];localStorage.setItem(KEY,JSON.stringify(next));return x}const payload={user_id:uid,ao3_work_id:w.ao3_work_id||null,ao3_url:w.ao3_url||null,title:w.title,author:w.author||null,status:w.status||'read',rating:w.rating||null,ao3_rating:w.ao3_rating||null,word_count:w.word_count||null,language:w.language||null,chapters:w.chapters||null,published_at:w.published_at||null,updated_at_ao3:w.updated_at_ao3||null,completed_at:(w.status||'read')==='read'?new Date().toISOString():null};let query=supabase.from('works');let result=w.ao3_work_id?await query.upsert(payload,{onConflict:'user_id,ao3_work_id'}).select().single():await query.insert(payload).select().single();const {data,error}=result;if(error)throw error;const tagSet=[...(w.tags||[]),...(w.fandoms||[]),...(w.relationships||[]),...(w.characters||[])].map(x=>String(x).trim()).filter(Boolean);if(tagSet.length){await supabase.from('work_tags').delete().eq('work_id',data.id);const {error:tagErr}=await supabase.from('work_tags').insert([...new Set(tagSet)].map(tag=>({work_id:data.id,tag})));if(tagErr)throw tagErr}return data}
export async function removeWork(uid,id){if(!supabase){localStorage.setItem(KEY,JSON.stringify(localBooks().filter(x=>x.id!==id)));return}const {error}=await supabase.from('works').delete().eq('id',id).eq('user_id',uid);if(error)throw error}
export async function library(uid){if(!supabase)return{display_name:'My RaevynShelf'};const {data,error}=await supabase.from('libraries').select('id,display_name,slug,is_public').eq('user_id',uid).maybeSingle();if(error)throw error;return data||{display_name:'My RaevynShelf'}}
export async function saveLibrary(uid,name){const value=name.trim()||'My RaevynShelf';if(!supabase)return{display_name:value};const {data,error}=await supabase.from('libraries').upsert({user_id:uid,display_name:value},{onConflict:'user_id'}).select().single();if(error)throw error;return data}


export async function getActiveStatCard(userId) {
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from("stat_cards")
    .select("id, share_token, display_name, theme, statistics_snapshot, is_active, created_at, updated_at")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function createOrRefreshStatCard(userId, displayName, theme = "midnight") {
  if (!supabase || !userId) throw new Error("Supabase is required to publish a stat card.");

  const [library, works] = await Promise.all([
    getLibrary(userId),
    loadWorks(userId)
  ]);
  const stats = calculateStats(works);

  let libraryRow = library;
  if (!libraryRow?.id) {
    libraryRow = await saveLibrary(userId, displayName || "My RaevynShelf");
  }

  const existing = await getActiveStatCard(userId);
  const payload = {
    user_id: userId,
    library_id: libraryRow.id,
    display_name: (displayName || libraryRow.display_name || "My RaevynShelf").trim(),
    theme,
    statistics_snapshot: stats,
    is_active: true,
    updated_at: new Date().toISOString()
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from("stat_cards")
      .update(payload)
      .eq("id", existing.id)
      .eq("user_id", userId)
      .select("id, share_token, display_name, theme, statistics_snapshot, is_active, updated_at")
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("stat_cards")
    .insert(payload)
    .select("id, share_token, display_name, theme, statistics_snapshot, is_active, updated_at")
    .single();
  if (error) throw error;
  return data;
}

export async function disableStatCard(userId, cardId) {
  if (!supabase || !userId || !cardId) return;
  const { error } = await supabase
    .from("stat_cards")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", cardId)
    .eq("user_id", userId);
  if (error) throw error;
}

export const calculateStats = stats;
export const getLibrary = library;

import type { MetadataRoute } from "next";
export default function sitemap():MetadataRoute.Sitemap{
  const base=process.env.NEXT_PUBLIC_SITE_URL;
  if(!base)return [];
  return ["","/learn","/learn/glossary","/disclosures","/privacy","/terms"].map(path=>({url:`${base.replace(/\/$/,"")}${path}`,lastModified:new Date()}));
}

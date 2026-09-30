"use client";
import{useEffect,useRef}from"react";
import"leaflet/dist/leaflet.css";
export default function MapView({ngos,stations,donor,hi=[],h=300,onPick}){
 const pickRef=useRef(onPick);pickRef.current=onPick;
 const el=useRef(null),map=useRef(null),layer=useRef(null);
 useEffect(()=>{let dead=false;(async()=>{const L=(await import("leaflet")).default;
  if(dead||!el.current)return;
  if(!map.current){map.current=L.map(el.current).setView([19.2,72.85],11);
   L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:18}).addTo(map.current);layer.current=L.layerGroup().addTo(map.current)}
  layer.current.clearLayers();
  stations.forEach(s=>L.circleMarker(s.c,{radius:5,color:"#0B2A55",fillColor:"#fff",fillOpacity:1,weight:2}).bindTooltip(s.name,{permanent:true,direction:"right"}).addTo(layer.current));
  ngos.forEach(n=>{const on=hi.includes(n.id);L.circleMarker([n.lat,n.lng],{radius:on?10:7,color:on?"#F97316":"#1A6FE0",fillColor:on?"#F97316":"#1A6FE0",fillOpacity:.8,weight:2}).bindPopup(`<b>${n.name}</b><br>${n.area}<br>${n.type}<br><i>click for profile</i>`).on("click",()=>pickRef.current&&pickRef.current(n)).addTo(layer.current)});
  if(donor)L.circleMarker(donor,{radius:11,color:"#16A34A",fillColor:"#16A34A",fillOpacity:.9}).bindTooltip("Donor",{permanent:true}).addTo(layer.current);
 })();return()=>{dead=true}},[ngos,stations,donor,hi.join()]);
 return<div ref={el} style={{height:h}} className="rounded-2xl border overflow-hidden"/>}

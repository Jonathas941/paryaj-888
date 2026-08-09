import React, { useState } from "react";
import { Gamepad2, Heart, Play, Info } from "lucide-react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { Image } from "@/components/ui/image";
import { SkeletonList } from "@/components/common/LoadingSkeleton";
import EmptyState from "@/components/common/EmptyState";

const CATS = ["popular", "new", "slots", "live_casino", "table_games", "crash", "jackpots", "instant", "game_shows", "favorites"];

export default function Casino() {
  const [cat, setCat] = useState("popular");
  const { data: games, loading } = useApi(() => api.getGames({ category: cat }), [cat]);
  const [favs, setFavs] = useState({});

  return (
    <div className="px-4 py-4 max-w-5xl mx-auto">
      <h1 className="text-lg font-bold mb-1">Casino</h1>
      <p className="text-sm text-muted-foreground mb-4">Games are delivered dynamically by external providers.</p>
      <div className="flex gap-1 overflow-x-auto no-scrollbar mb-5 -mx-4 px-4">
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap ${cat === c ? "bg-primary text-black" : "bg-surface-2/50 text-muted-foreground border border-border"}`}>{c.replace("_", " ")}</button>
        ))}
      </div>

      {loading ? <SkeletonList count={4} /> : (games || []).length === 0 ? (
        <div className="glass rounded-xl"><EmptyState icon={Gamepad2} title="No games in this category" message="Games load dynamically from connected providers." /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {(games || []).map(g => (
            <div key={g.id} className="glass rounded-xl overflow-hidden group">
              <div className="relative aspect-[3/4]">
                <Image src={g.image} alt={g.title} fittingType="fill" className="w-full h-full" />
                <button onClick={() => setFavs(f => ({ ...f, [g.id]: !f[g.id] }))}
                  className="absolute top-2 right-2 w-8 h-8 grid place-items-center rounded-lg bg-black/40 backdrop-blur">
                  <Heart className={`w-4 h-4 ${favs[g.id] ? "fill-danger text-danger" : "text-white"}`} />
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3 gap-2">
                  <button className="flex-1 bg-gradient-to-r from-primary to-bright text-black text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1"><Play className="w-3 h-3" /> Play</button>
                  {g.demo && <button className="w-9 h-9 grid place-items-center bg-black/40 rounded-lg"><Info className="w-4 h-4" /></button>}
                </div>
              </div>
              <div className="p-2.5"><div className="font-semibold text-sm truncate">{g.title}</div><div className="text-[11px] text-muted-foreground">{g.provider}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
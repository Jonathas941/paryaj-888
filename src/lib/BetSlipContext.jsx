import React, { createContext, useContext, useState, useCallback } from "react";

const BetSlipContext = createContext(null);

export function BetSlipProvider({ children }) {
  const [selections, setSelections] = useState([]);
  const [stake, setStake] = useState("");
  const [betType, setBetType] = useState("single");
  const [open, setOpen] = useState(false);

  const isDuplicate = (sel) =>
    selections.some(s => s.eventId === sel.eventId && s.selectionId === sel.selectionId);

  const addSelection = useCallback((sel) => {
    setSelections(prev => {
      if (isDuplicate(sel)) return prev.filter(s => !(s.eventId === sel.eventId && s.selectionId === sel.selectionId));
      return [...prev, sel];
    });
  }, []);

  const removeSelection = useCallback((eventId, selectionId) => {
    setSelections(prev => prev.filter(s => !(s.eventId === eventId && s.selectionId === selectionId)));
  }, []);

  const updateSelectionOdds = useCallback((eventId, selectionId, odds) => {
    setSelections(prev => prev.map(s => (s.eventId === eventId && s.selectionId === selectionId ? { ...s, odds } : s)));
  }, []);

  const clear = useCallback(() => { setSelections([]); setStake(""); }, []);

  const totalOdds = selections.reduce((acc, s) => acc * Number(s.odds), 1);
  const potentialPayout = (Number(stake) || 0) * totalOdds;

  return (
    <BetSlipContext.Provider value={{
      selections, addSelection, removeSelection, updateSelectionOdds, clear,
      stake, setStake, betType, setBetType,
      totalOdds, potentialPayout, open, setOpen,
      count: selections.length
    }}>
      {children}
    </BetSlipContext.Provider>
  );
}

export function useBetSlip() {
  const ctx = useContext(BetSlipContext);
  if (!ctx) throw new Error("useBetSlip must be used within BetSlipProvider");
  return ctx;
}
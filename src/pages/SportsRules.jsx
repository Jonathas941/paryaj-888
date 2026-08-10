import LegalPage from "@/components/common/LegalPage";

export default function SportsRules() {
  return (
    <LegalPage
      title="Sports Betting Rules"
      subtitle="These rules govern the placement, settlement, and voiding of sports bets on PARYAJ 888. They apply alongside our Terms & Conditions and any market-specific rules displayed at the time of betting."
      lastUpdated="August 1, 2026"
      sections={[
        {
          heading: "General Rules",
          body: "All bets are settled based on the official result of the event as published by the governing body, unless otherwise stated. Bets are accepted on the understanding that the event remains open for betting at the time of placement.",
          list: [
            "Odds shown at bet placement are the odds applied; the backend re-validates odds before acceptance.",
            "If odds have changed between display and placement, the bet is rejected with no stake deducted.",
            "Bets placed after an event has started may be voided unless the market is explicitly offered live.",
            "The maximum payout per bet and per event is published in your account terms.",
          ],
        },
        {
          heading: "Bet Settlement",
          body: "Bets are settled once the official result is confirmed. For most sports, this is the result at full time, including any added time or overtime where applicable, but excluding penalty shootouts unless the market specifically includes them.",
        },
        {
          heading: "Void & Cancelled Bets",
          body: "A bet may be voided (stake returned) in circumstances including:",
          list: [
            "The event is cancelled, postponed beyond 48 hours, or abandoned before completion.",
            "A participant is disqualified or withdraws before the event starts (for head-to-head markets).",
            "A market is offered in error or with incorrect odds due to a technical fault.",
            "Venue or surface conditions change materially after odds are set (selected sports).",
          ],
        },
        {
          heading: "Live Betting",
          body: "Live (in-play) markets are offered while an event is in progress. Odds update continuously and may be suspended at any time. Bets placed on suspended or closed markets may be voided. Settlement is based on the state of the event at the time of bet placement unless the market describes a future outcome.",
        },
        {
          heading: "Football (Soccer)",
          list: [
            "Full-time result includes 90 minutes plus injury time, excluding extra time and penalties.",
            "To qualify / to win markets include extra time and penalties where applicable.",
            "If a match is abandoned before completion, all bets are void unless a result is officially declared.",
            "Own goals count toward the team credited with the goal.",
          ],
        },
        {
          heading: "Basketball",
          list: [
            "Game result includes overtime unless a 'to win in regulation' market is offered.",
            "If a game is abandoned, bets on completed markets stand; others are void.",
            "Player performance markets require the player to appear; otherwise the bet is void.",
          ],
        },
        {
          heading: "Tennis",
          list: [
            "Match bets require at least one set to be completed; otherwise void.",
            "If a player retires after the first set, the player progressing is settled as the winner for match markets.",
            "Set and game markets are void if the match is abandoned before the relevant set completes.",
          ],
        },
        {
          heading: "Dead Heat",
          body: "Where two or more participants tie for a placing, dead-heat rules apply: the stake is divided by the number of tied participants, and each portion is settled at the full odds. For example, a two-way dead heat pays half the stake at full odds and returns half the stake.",
        },
        {
          heading: "Abandoned & Postponed Events",
          body: "If an event is postponed and rescheduled within 48 hours, bets stand. If rescheduled beyond 48 hours or cancelled, all affected bets are void and stakes returned. Bets on events that are abandoned before an official result are void unless the market has already been determined.",
        },
        {
          heading: "Result Disputes",
          body: "Results are based on the official governing-body data at settlement. If a result is later amended by the governing body, we will not generally re-settle bets that were already settled. Disputes should be raised with Support within 7 days of settlement, with supporting evidence.",
        },
      ]}
    />
  );
}
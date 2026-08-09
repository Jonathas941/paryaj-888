-- Catalogue seed. Idempotent: safe to re-run.
-- Fixtures deliberately mirror the approved homepage design so the UI looks
-- identical the moment it switches off sample mode.

INSERT INTO sports (id, name, icon, display_order) VALUES
  ('soccer','Football','soccer',1),
  ('basketball','Basketball','basketball',2),
  ('tennis','Tennis','tennis',3),
  ('boxing','Boxing','boxing',4),
  ('mma','MMA','mma',5),
  ('esports','Esports','esports',6),
  ('baseball','Baseball','baseball',7),
  ('hockey','Hockey','hockey',8)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, display_order = EXCLUDED.display_order;

INSERT INTO leagues (id, sport_id, name, country) VALUES
  ('epl','soccer','Premier League','England'),
  ('laliga','soccer','La Liga','Spain'),
  ('seriea','soccer','Serie A','Italy'),
  ('nba','basketball','NBA','USA'),
  ('atp','tennis','ATP Rome','International'),
  ('ufc','mma','UFC Fight Night','International')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Live fixtures. A deterministic UUID per fixture keeps re-runs idempotent.
INSERT INTO events (id, sport_id, league_id, home_team, away_team, start_time, status, home_score, away_score, minute) VALUES
  ('a0000000-0000-4000-8000-000000000001','soccer','epl','Man City','Liverpool',      now() - interval '78 minutes','LIVE',2,1,'78'''),
  ('a0000000-0000-4000-8000-000000000002','soccer','laliga','Real Madrid','Barcelona', now() - interval '63 minutes','LIVE',1,0,'63'''),
  ('a0000000-0000-4000-8000-000000000003','basketball','nba','Boston Celtics','Miami Heat', now() - interval '46 minutes','LIVE',58,52,'45+1'''),
  ('a0000000-0000-4000-8000-000000000004','mma','ufc','A. Volkanovski','I. Topuria',  now() - interval '20 minutes','LIVE',NULL,NULL,'Round 3'),
  ('a0000000-0000-4000-8000-000000000005','tennis','atp','J. Sinner','C. Alcaraz',    now() - interval '22 minutes','LIVE',1,0,'22'''),
  ('a0000000-0000-4000-8000-000000000006','soccer','epl','Arsenal','Chelsea',         now() + interval '1 day','SCHEDULED',NULL,NULL,NULL),
  ('a0000000-0000-4000-8000-000000000007','soccer','seriea','Juventus','Inter',       now() + interval '1 day','SCHEDULED',NULL,NULL,NULL),
  ('a0000000-0000-4000-8000-000000000008','basketball','nba','Denver Nuggets','LA Lakers', now() + interval '2 days','SCHEDULED',NULL,NULL,NULL)
ON CONFLICT (id) DO UPDATE
  SET home_score = EXCLUDED.home_score,
      away_score = EXCLUDED.away_score,
      status     = EXCLUDED.status,
      minute     = EXCLUDED.minute;

-- 1X2 markets for the three-way fixtures.
INSERT INTO markets (id, event_id, name) VALUES
  ('b0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','1X2'),
  ('b0000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000002','1X2'),
  ('b0000000-0000-4000-8000-000000000006','a0000000-0000-4000-8000-000000000006','1X2'),
  ('b0000000-0000-4000-8000-000000000007','a0000000-0000-4000-8000-000000000007','1X2'),
  ('b0000000-0000-4000-8000-000000000003','a0000000-0000-4000-8000-000000000003','1X2'),
  ('b0000000-0000-4000-8000-000000000005','a0000000-0000-4000-8000-000000000005','1X2'),
  ('b0000000-0000-4000-8000-000000000008','a0000000-0000-4000-8000-000000000008','1X2')
ON CONFLICT (id) DO NOTHING;

INSERT INTO selections (id, market_id, name, odds, sort_order) VALUES
  -- Man City v Liverpool
  ('c0000000-0000-4000-8000-000000000101','b0000000-0000-4000-8000-000000000001','Home',1.620,1),
  ('c0000000-0000-4000-8000-000000000102','b0000000-0000-4000-8000-000000000001','Draw',3.800,2),
  ('c0000000-0000-4000-8000-000000000103','b0000000-0000-4000-8000-000000000001','Away',5.200,3),
  -- Real Madrid v Barcelona
  ('c0000000-0000-4000-8000-000000000201','b0000000-0000-4000-8000-000000000002','Home',2.050,1),
  ('c0000000-0000-4000-8000-000000000202','b0000000-0000-4000-8000-000000000002','Draw',3.400,2),
  ('c0000000-0000-4000-8000-000000000203','b0000000-0000-4000-8000-000000000002','Away',3.400,3),
  -- Celtics v Heat (two-way)
  ('c0000000-0000-4000-8000-000000000301','b0000000-0000-4000-8000-000000000003','Home',1.700,1),
  ('c0000000-0000-4000-8000-000000000302','b0000000-0000-4000-8000-000000000003','Away',2.100,2),
  -- Sinner v Alcaraz (two-way)
  ('c0000000-0000-4000-8000-000000000501','b0000000-0000-4000-8000-000000000005','Home',1.450,1),
  ('c0000000-0000-4000-8000-000000000502','b0000000-0000-4000-8000-000000000005','Away',2.650,2),
  -- Upcoming
  ('c0000000-0000-4000-8000-000000000601','b0000000-0000-4000-8000-000000000006','Home',2.100,1),
  ('c0000000-0000-4000-8000-000000000602','b0000000-0000-4000-8000-000000000006','Draw',3.300,2),
  ('c0000000-0000-4000-8000-000000000603','b0000000-0000-4000-8000-000000000006','Away',3.050,3),
  ('c0000000-0000-4000-8000-000000000701','b0000000-0000-4000-8000-000000000007','Home',2.400,1),
  ('c0000000-0000-4000-8000-000000000702','b0000000-0000-4000-8000-000000000007','Draw',3.200,2),
  ('c0000000-0000-4000-8000-000000000703','b0000000-0000-4000-8000-000000000007','Away',2.900,3),
  ('c0000000-0000-4000-8000-000000000801','b0000000-0000-4000-8000-000000000008','Home',1.900,1),
  ('c0000000-0000-4000-8000-000000000802','b0000000-0000-4000-8000-000000000008','Away',1.900,2)
ON CONFLICT (id) DO UPDATE SET odds = EXCLUDED.odds;

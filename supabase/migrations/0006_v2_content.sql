-- V2 polish pass — finalized shoot copy from the client, grammar/spelling
-- checked, tone kept as-is (personal, relaxed, not corporate). Updates
-- existing rows seeded in 0003_seed.sql; no new rows.

update public.shoots set
  name = 'Loveshoot',
  short_description = 'Puur & liefdevol',
  long_description = 'Een loveshoot draait voor mij om jullie op een pure en ontspannen manier vast te leggen. Vooral lekker spontaan wandelen en naar elkaar kijken, net doen alsof ik er niet ben.

De locatie mogen jullie helemaal zelf bedenken. Misschien hebben jullie samen een favoriete plek, een mooie herinnering of gewoon een omgeving die goed bij jullie past. Hebben jullie nog geen idee? Geen probleem! Ik heb zelf ook veel leuke ideeën voor mooie locaties en deel die natuurlijk graag met jullie.

Het mooiste licht voor een loveshoot vind ik tijdens zonsondergang. Het zachte, warme licht zorgt voor een romantische en dromerige sfeer en maakt de foto''s extra mooi.

Qua kleding vind ik lichte, natuurlijke tinten prachtig. Denk aan wit, beige, crème en bruin. Deze kleuren zorgen voor een rustige en zachte uitstraling en passen mooi bij de natuurlijke sfeer van de foto''s.

Tijdens de shoot neem ik alle tijd. De shoot duurt ongeveer 1 uur, maar er is geen haast. Ik wil vooral dat jullie plezier hebben samen en even helemaal kunnen genieten van elkaar.

Samen wandelen, lachen, elkaar vasthouden en gewoon jezelf zijn — juist die momenten maken de mooiste beelden.

Puur, warm, liefdevol en helemaal jullie.',
  duration_label = 'Ongeveer 1 uur'
where slug = 'loveshoot';

update public.shoots set
  name = 'Zwangerschap',
  short_description = null,
  long_description = 'Een zwangerschap is een bijzondere periode waarin je lichaam en jullie leven in korte tijd zoveel veranderen. Met een zwangerschapsshoot wil ik deze bijzondere tijd op een pure en liefdevolle manier voor jullie vastleggen.

Het liefst fotografeer ik buiten, in het natuurlijke licht en op een mooie plek die bij jullie past. Maar wanneer het weer niet meewerkt of jullie liever binnen foto''s willen maken, is dat natuurlijk ook mogelijk.

Voor de shoot heb ik twee mooie leenjurken in een zachte beige tint die je tijdens de shoot mag dragen. Deze zijn inbegrepen bij de prijs. Zo hoef je zelf niet op zoek naar een jurk en kun je je helemaal richten op dit bijzondere moment.

Ik neem tijdens de shoot alle tijd. Er is geen haast en ik vind het belangrijk dat je je comfortabel voelt.

Mijn advies is om de zwangerschapsshoot tussen de 28 en 34 weken te plannen. Vaak heb je dan al een mooie ronde buik, maar voel je je over het algemeen nog fit genoeg om ontspannen van de shoot te genieten.

De locatie mogen jullie helemaal zelf bedenken. Misschien is er een plek waar jullie samen graag komen of die een bijzondere betekenis voor jullie heeft. Hebben jullie nog geen idee? Geen probleem! Ik heb zelf ook veel mooie ideeën voor locaties en deel die graag met jullie, zodat we samen iets kunnen kiezen dat echt bij jullie past.

Zacht, puur, liefdevol en met alle tijd en aandacht voor deze bijzondere periode.',
  duration_label = 'Ongeveer 1 uur'
where slug = 'zwangerschapsshoot';

update public.shoots set
  name = 'Newborn',
  short_description = 'Puur & liefdevol',
  long_description = 'Een newbornshoot draait voor mij om het vastleggen van die kleine, bijzondere momenten die zo snel voorbijgaan.

Met kleedjes, een mooi mandje en mijn favoriete lichte tinten — crème, beige, bruin en wit — creëer ik een rustige sfeer waarin jullie newborn helemaal centraal staat.

Tijdens de shoot neem ik alle tijd. Er is geen haast en niets hoeft volgens een strak schema. Is jullie baby hongerig? Dan nemen we rustig de tijd om te voeden. Heeft jullie newborn behoefte aan een knuffel, dan passen we ons daar gewoon op aan.

Veiligheid staat bij mij boven alles. Ik werk rustig en zorgvuldig, zodat alles goed verloopt.

Ik houd van pure beelden: kleine teentjes, handjes en kleine oortjes, maar vooral de liefde tussen jullie als gezin. Geen poespas, maar gewoon zoals het is!

Puur, zacht, liefdevol en met alle tijd en aandacht voor jullie kleine wonder.',
  duration_label = 'Ongeveer 1,5 uur'
where slug = 'newbornshoot';

update public.shoots set
  name = 'Gezin',
  short_description = 'Puur & liefdevol',
  long_description = 'Een gezinsshoot draait voor mij om het vastleggen van jullie gezin zoals jullie écht zijn.

Het allerbelangrijkste vind ik dat de kinderen plezier hebben en zich vrij voelen. Daarom fotografeer ik het liefst op een plek waar ze lekker kunnen spelen. Het zand is daar perfect voor! Bijvoorbeeld in de duinen, waar een grote zandvlakte eigenlijk één grote natuurlijke speeltuin wordt. Terwijl de kinderen spelen, rennen, ontdekken en plezier maken, ontstaan juist de mooiste momenten.

Heeft een kindje even geen zin om op de foto te gaan? Dan gaan we dat vooral niet forceren. Geen gedoe en geen druk. Lekker spelen, ontdekken en even hun eigen ding doen.

En iets wat kinderen vaak helemaal geweldig vinden: ze mogen zelf ook een foto maken. Ze krijgen de ruimte om mee te doen en vinden het vaak ontzettend leuk om zelf de camera vast te houden en foto''s van papa, mama, broertjes of zusjes te maken.

Tijdens de shoot neem ik alle tijd. We hoeven niet te haasten en er is ruimte voor spelen, knuffelen, rennen en ontspanning. De shoot duurt ongeveer 1 uur, maar voor mij draait het vooral om een fijne ervaring voor jullie hele gezin.

Puur, ontspannen, liefdevol en vooral met heel veel plezier.',
  duration_label = 'Ongeveer 1 uur'
where slug = 'gezinsshoot';

update public.shoots set
  name = 'Familie',
  short_description = 'Samen, puur & liefdevol',
  long_description = 'Met een grote familie heb je zoveel verschillende momenten en verbindingen om vast te leggen. Niet alleen de hele familie samen, maar ook de verschillende gezinnen, opa en oma met de kleinkinderen, broers en zussen en natuurlijk ook de mensen afzonderlijk.

Ik vind het daarom mooi om tijdens een familieshoot verschillende combinaties te fotograferen. We beginnen bijvoorbeeld met een grote groepsfoto en daarna fotografeer ik alle gezinnen afzonderlijk. Ook is er ruimte voor foto''s van bijvoorbeeld opa en oma samen, de kinderen onderling of andere combinaties die jullie graag willen.

Wat ik zelf heel mooi vind, is wanneer iedereen qua kleding een beetje binnen hetzelfde thema blijft. Denk aan natuurlijke kleuren zoals beige, crème, wit en bruin. Hierdoor ontstaat er één geheel en krijgen de foto''s een rustige uitstraling.

De locatie mogen jullie zelf uitzoeken. Misschien hebben jullie een plek die veel voor jullie betekent, of juist een mooie plek waar jullie vaak komen. Hebben jullie nog geen idee? Dan denk ik natuurlijk graag met jullie mee en kan ik verschillende ideeën voor locaties aandragen.

Bij een grote familie komt natuurlijk best wat kijken. Daarom neem ik de tijd om alles rustig te laten verlopen. Ik vind het belangrijk dat iedereen zich prettig voelt en dat het geen gehaaste bedoeling wordt. We maken er samen een gezellige en ontspannen shoot van.

Een moment samen, om later keer op keer naar terug te kijken.',
  duration_label = 'Ongeveer 1 uur'
where slug = 'familieshoot';

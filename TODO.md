# TODOS
neueste erledigte oben

## Goldberg-Tarjan:
- [x] Im rechten Teil: nicht alle Kanten e in g zeigen, sondern nur Kanten des Residual Netwerks g', welche den aktuellen (roten) Knoten verlassen. Diese gestrichelt rendern und mit ihren Residual Kapazitäten c'. Ausserdem bei einem push die residual Kante über die gepusht wurde fett rot hervorheben, und bei einem relabel die residual kante zum Knoten mit der niedrigsten Höhe grün hervorheben.
  [(2016-31-05)](https://github.com/adrelino/idp-graph-algorithms/commit/ed1a0cc161a97bc6153aabd4daaee3121c8eea3f)
  * added graph' option to right side, readded exessBar and nodeText height / excess in Heightfunction drawer, whose display depends on currently selected viewing mode
- [x] Aktive Kante bei Push/Relabel hervorheben
  [(2016-05-30)](https://github.com/adrelino/idp-graph-algorithms/commit/fd8af934f74879a27260acb9b7986f568cc1f9c0)
  * gemacht auf linker seite.
- [x] Abh. von Browser werden Pfeilspitzen nicht angezeigt (nicht in FF, IE, Edge, aber unter Safari und Chrome)
  [(2016-30-05)](https://github.com/adrelino/idp-graph-algorithms/commit/6998c6ac171c33f3c535eea952d443ae641cad3d)
- [x] s und t in gleicher Farbe hervorheben, rot vermeiden
  (2016-04-26)
- [x] Infos an Knoten zu Excess und Höhe weglassen, verwirrt in unseren Augen
  (2016-04-26)
  * stattdessen im rechten Teil koordinatensystem x:excess y:hoehe
- [x] In rechtem Teil: Kanten ohne Infos zu Kap/Fluss, dadurch wird es unserer Meinung übersichtlicher
  (2016-04-26)
  * dafür im linken teil
- [x] Nur aktiven Knoten hervorheben (statt aller mit Excess), idealerweise durch Färbung des gesamten Knoten
  (2016-04-26)
  * in Rot gefärbt
- [x] Bei Darstellung der Höhefunktion die ID-Achse weglassen, stattdessen evtl. Knoten nach Höhe abfallend sortieren (macht die Idee des Algorithmus klarer?)
  (2016-04-26)
  * man kann wählen zwischen Excess / id auf der x Achse. Höhe war sowieso schon auf der y Achse.

## SPPRC:
- [x] Hervorheben der Kante, entlang derer extended wird?
  (2016-05-03)
  * Kante e wird links fett dargestellt
- [x] Einfärbung aller Label gemäß Knoten finden wir verwirrend, evtl. weglassen?
  (2016-06-26)
  * weglassen (in dominance)
- [x] Aktives Label nicht rot hervorheben (rot = falsch?)
  (2016-06-26) 
  * wird doch rot hervorgehoben
- [x] label beschriftung kuerzer, ggf entfernen mit hovering
  (2016-06-26)
  * alphabet a-z als id
- [x] unprocessed label gelb, processed gruen
  (2016-06-28)
- [x] Im graph nur rot fuer vertex von dem aus extended wird. Gelb und gruen macht keine sinn auf nodes
  (2016-06-28)
- [x] label an v ueberschrift in label anzeigen, 
  (2016-09-26)
- [x] beim extenden zwischenlabel ausblenden, am anfang vom loop alle wieder anzeigen
  (2016-09-26)
- [x] zeitfenster und residentVertex zuordnen (umrahmung)
  (2016-09-26)
- [x] Interaktivität: links click auf knoten: rechts alle label die im knoten enden + timeWindow des knotens
  (2016-09-26)
- [ ] Interaktivität: rechts click auf label: links den pfad hervoheben (rot oder fett))
- [ ] unprocessed in sortierter reihenfolge nach resident vertex abarbeiten bei dominance
- [ ] Rechter Teil: Zeitfenster weiter hochziehen, obere Label sind außerhalb
- [ ] Sicherstellen, dass man bei bis zu 20 Knoten auch noch in beiden Visualisierungsebenen etwas erkennen kann und sich nicht alle knoten dann überlappen

## Beide:
- [x] Beschreibung beschreibt was gerade links passiert ist / ab initialize beschreibungen eins früher anzeigen
  (2016-05-25)
  * noch offen: BEGIN/START des Algorithmus taucht nicht im LOG auf

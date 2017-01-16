# idp-graph-algorithms

## TODOS

### Beide:
- [ ] Zu den dynamischen Kommentaren/Log anzeigen: Das Log finde ich zu technisch, das aber in umformatierter/einfacher Form wäre ok.
- [x] Erzeugung von Kanten: Können diese zufällige Kantenbewertungen bekommen statt immer 0?
  * (2017-01-17) Ja, jetzt bekommen sie Zufallswerte zwischen 0 und 10. Das geht auch bei mehrdimensionalen resource vectoren wie beim SPPRC. Für den SPPTW bekommen die nodes ausserdem random time-windows im bereich von 0-100, wobei immer arrival<=departure ist.
- [ ] Ausführung: Zeit für Animation ausblenden, Tabs wieder einführen (dann muss ich die Texte nochmal lesen)
- [ ] More: Speed and Termination of algorithm: Sketch a nice proof, link to references for more details.
- [ ] Introduction und Description: Problemstellung sowie Idee des algorithmus text finalisieren
- [ ] Legende vervollständigen/ an neue Farben anpassen
- [ ] Tabs sollten wir am Ende wieder einfügen, von der Synchronisierung passt es aber. 
- [ ] Die Menge der Informationen und die Visualisierung sollten passen, arbeite wie oben erwähnt noch etwas daran, die Informationen auch mit dem Text zu verknüpfen (sonst wird es etwas unübersichtlich).
- [x] Beschreibung beschreibt was gerade links passiert ist / ab initialize beschreibungen eins früher anzeigen
  (2016-05-25)
  * noch offen: BEGIN/START des Algorithmus taucht nicht im LOG auf

### SPPRC:
- [ ] Einleitung finde ich sehr knapp, darf gerne noch ein wenig ausführlicher sein
- [ ] Wie können Zeitfenster angepasst werden?
  * Im Grapheditor mit Doppelklick auf das Zeitfenster, genauso wie man z.B. Kantengewichte ändert
- [x] Ende der Ausführung: Kein Hover, um Pfade zu sehen, sondern ein Klick?
  * (2017-01-17) text gefixed
- [x] Zielknoten würde ich nicht wählen, lass es so. Könnte man den Start wählen, oder wird der immer vorgegeben?
- [ ] Beschreibung: Auf Unvergleichbarkeit von Pfaden etwas ausführlicher eingehen (Bsp in 2-3 Sätzen?)
- [ ] Description: 
  * describe how to extend a label
  * describe how to check for feasability
  * describe dominance step
- [ ] Rechter Teil: Zeitfenster weiter hochziehen, obere Label sind außerhalb
- [ ] Sicherstellen, dass man bei bis zu 20 Knoten auch noch in beiden Visualisierungsebenen etwas erkennen kann und sich nicht alle knoten dann überlappen
- [x] Description: 
  * describe incomparable paths / paretor frontier
  (2016-10-01)
- [x] Dominance: ignore vertices with less than 2 incoming paths, nicer log messages
  (2016-10-01)
- [x] Filtering step fertig implementieren: target t auswählen können sobald main loop fertig, dann für diesen den pfad mit geringsten kosten berechnen
  (2016-09-30)
  * best cost path to target t is shown in green on both sides when in last step of algorithm and clicked on node.
- [x] Dominance: in sortierter reihenfolge nach resident vertex abarbeiten. Dazu neuen Status je residentVertex einführen
  (2016-09-30)
  * TODO: tunen der Label Sichtbarkeit und Node highlight
- [x] Interaktivität: rechts click auf label: links den pfad hervoheben (rot oder fett))
  [(2016-09-28)]
- [x] Beim extenden zwischenlabel ausblenden, am anfang vom loop alle wieder anzeigen
  [(2016-09-26)](https://github.com/adrelino/idp-graph-algorithms/commit/b2686514061b6f3dc1076fc42e9cea68a996fa7b)
  * label von dem aus extended wird (rot) wird mit transition ausgeblendet, das neue label (orange) mit transition eingeblendet
- [x] Interaktivität: links click auf knoten: rechts alle label die im knoten enden.
  [(2016-09-25)](https://github.com/adrelino/idp-graph-algorithms/commit/30bbcf54fbe39a209f4ea7b5d6fa9fc35ee4678a)
  * rechts: label an v ueberschrift anzeigen. (mittels auswahlbox)
  * zeitfenster (umrahmung) des und Knoten/residentVertex zuordnen. Es gibt immer nur ein zeitfenster. Wenn 'all' gewählt ist wird nix angezeigt
- [x] unprocessed label gelb, processed gruen
  (2016-06-28)
- [x] Im graph nur rot fuer vertex von dem aus extended wird. Gelb und gruen macht keine sinn auf nodes
  (2016-06-28)
- [x] Einfärbung aller Label gemäß Knoten finden wir verwirrend, evtl. weglassen?
  (2016-06-26)
  * weglassen (in dominance)
- [x] Aktives Label nicht rot hervorheben (rot = falsch?)
  (2016-06-26) 
  * wird doch rot hervorgehoben
- [x] label beschriftung kuerzer, ggf entfernen mit hovering
  (2016-06-26)
  * alphabet a-z als id
- [x] Hervorheben der Kante, entlang derer extended wird?
  (2016-05-03)
  * Kante e wird links fett dargestellt

### Goldberg-Tarjan:
- [ ] Problem Definition as in documentation:
  * flow network
  * feasible flow
  * maximum flow
  * residual graph: describe how to construct the residual network
- [ ] Idea of the algorithm as in documentation:
  * excess and preflow
  * active node
  * height, valid labeling
  * eligible edge
  * describe how to carry out push and relabel operations (like in algoprak reference)
- [x] Ausführung: In den kurzen Beschreibungen gerade zu Beginn kurz darauf eingehen, wie die Begriffe visualisiert sind (Preflow, Active Nodes, Aktiver Knoten, ...)
  (2017-01-16) done, die verschiedenen Begriffe (s,t,edge preflow/cap,active nodes, height, current node, eligible edge, minimum height edge) werden nacheinander in den verschiedenen Ausführungsschritten eingeführt und deren Visualisierung und vorallem die dazugehörigen Farben erklärt.
- [x] Kann man Start- und Zielknoten wählen, oder werden die immer vorgegeben?
  (2017-01-16) Ja, jetzt wird auch im text darauf hingewiesen wie.
- [x] hide or dash with fewer dashes the residual edges with 0 capacity (because by definition, these don't actually exist)
  (2017-01-16) Done, they get opacity 0 and a style transition so that they disappear slowly after a saturating push. For relabeling and searching the neighbouring node with minimal height, it is important that these edges are not displayed, which would be confusing.
- [x] Stefan Walzer TU Ilmenau: Wir bevorzugen die „height/id“ Ansicht (weil wir den excess Wert nicht so entscheidend finden und weil es passieren kann, dass Knoten in der „height/excess“ Ansicht übereinander liegen). Leider schalten die Implementierung bei jeden Klick auf „next“ zu „height/excess“ um.
  [(2016-11-09)](https://github.com/adrelino/idp-graph-algorithms/commit/4f145861dfba5f8305a24c0f9cc4263cf2b17dcf)
  * added checkbox to fix axis during algorithm execution
  * added url param ?axis=[height/id, height/excess, y/x] to preselect and fix axis initially.
- [x] Und dann vllt noch ein paar Farben beim Variablenstatus?
  (2016-10-11) red, yellow for active vertex and queue, orange and green for active edge in push or relabel operation
- [x] Ich würde noch vorschlagen, die Texte noch leicht zu ergänzen:
  * Wenn du Knoten auswählst und die rot markierst, weise darauf hin (...pop v from the queue (marked in red on the left)... oder ähnlich). Ebenso bei den Knoten in der Queue in gelb und der Kante in rot.
  * Falls du in Beschreibung noch Platz hast, kannst du eventuell auch bei den Push- und Relabel-Operationen kurz aufführen, wie viel du pusht und auf welches Level du relabelst (also den tatsächlichen Wert). 
  Ich könnte mir einfach eine zusätzliche Zeile mit "New height of node 5: 10" vorstellen.
  [(2016-09-29)]
- [x] Du sprichst manchmal von distance, manchmal von height. Versuche, das eindeutig zu halten.
  [(2016-09-29)]
- [x] Im rechten Teil: nicht alle Kanten e in g zeigen, sondern nur Kanten des Residual Netwerks g', welche den aktuellen (roten) Knoten verlassen. Diese gestrichelt rendern und mit ihren Residual Kapazitäten c'. Ausserdem bei einem push die residual Kante über die gepusht wurde fett rot hervorheben, und bei einem relabel die residual kante zum Knoten mit der niedrigsten Höhe grün hervorheben.
  [(2016-05-31)](https://github.com/adrelino/idp-graph-algorithms/commit/ed1a0cc161a97bc6153aabd4daaee3121c8eea3f)
  * added graph' option to right side, readded exessBar and nodeText height / excess in Heightfunction drawer, whose display depends on currently selected viewing mode
- [x] Aktive Kante bei Push/Relabel hervorheben
  [(2016-05-30)](https://github.com/adrelino/idp-graph-algorithms/commit/fd8af934f74879a27260acb9b7986f568cc1f9c0)
  * gemacht auf linker seite.
- [x] Abh. von Browser werden Pfeilspitzen nicht angezeigt (nicht in FF, IE, Edge, aber unter Safari und Chrome)
  [(2016-05-30)](https://github.com/adrelino/idp-graph-algorithms/commit/6998c6ac171c33f3c535eea952d443ae641cad3d)
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
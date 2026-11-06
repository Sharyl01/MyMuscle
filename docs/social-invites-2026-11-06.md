# Sociale uitnodigingen — 6 november 2026

Deze ontwikkelbranch voegt de websitekant van de MyMuscle-uitnodigingslinks toe:

- `/invite/group/[code]` en `/invite/friend/[code]` valideren hun routeparameters en tonen een uitnodigingspagina.
- De pagina opent de geïnstalleerde app via `musclefront://invite/...`; Android gebruikt een packagegebonden intent met de bestaande Google Play-link als fallback.
- De App Store- en Google Play-knoppen blijven beschikbaar. Na een nieuwe installatie opent de ontvanger de oorspronkelijke uitnodigingslink opnieuw.
- De Apple-associatieroute ondersteunt nu ook `/invite/*`.
- Er wordt op de website geen lidmaatschap of vriendschap aangemaakt. De app vraagt daarvoor expliciete toestemming en gebruikt de bestaande servercontroles.

Bijbehorende appbranch en volledig wijzigings-/testrapport:

`https://github.com/Sharyl01/MyMuscleApp/tree/codex/feedback-fixes-2026-11-06`

TypeScript en ESLint van deze bestanden slagen. De lokale browsercontrole verifieerde beide uitnodigingspagina's, een oudere groepscode met spaties en een hash, winkel- en native links, een 404 voor een ongeldige vriendencode, Apple-associatie en mobiele weergave zonder horizontale overflow. Er waren geen JavaScript-pageerrors.

Deze wijziging is niet naar productie gepubliceerd. Voor vrijgave zijn een fysieke iOS-/Android-test en publicatie van de website-/associatiewijzigingen nodig. De app heeft voor de nieuwe Android-intentfilter een nieuwe native build nodig.

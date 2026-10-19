# Blood on the Bunge

**An interactive memorial and investigation of 25 June 2024, the day Kenyan security forces shot protesters dead at parliament.**

**▶ [june25th.vercel.app](https://june25th.vercel.app)**

On 25 June 2024, more than 100,000 Kenyans marched on parliament to stop the Finance Bill. Three unarmed men, **David Chege**, **Ericsson Mutisya** and **Eric Shieni**, were shot dead on and beside its grounds. Their deaths were filmed from every angle. In 2025, BBC Africa Eye's investigation [*Blood Parliament*](https://www.youtube.com/watch?v=qz0f1yyf_eA) used thousands of photos and videos to identify who fired. Two years on, no one has been charged.

This site retells that day and that investigation as a story you scroll through. It is best experienced on the site itself, so this page won't describe it. Take your time with it.

<p align="center">
  <img src="docs/hero.jpg" width="80%" alt="Opening screen of the site: the title 'Blood on the Bunge' beside a phone showing a protester's livestream">
</p>

> **Content warning:** the story describes killings and includes footage from the scene. The most graphic footage in the film is deliberately left out.

## About the reporting

Every factual claim on the site is attributed, and the sources are listed below and at the end of the story. Identifications of the security forces involved are the BBC's. Locations shown on the map are approximate.

## Built with

Plain HTML, CSS and JavaScript, with [GSAP](https://gsap.com), [three.js](https://threejs.org) and [OpenStreetMap](https://www.openstreetmap.org) data. To run it locally:

```bash
python3 dev/server.py    # then open http://127.0.0.1:8765
```

## Sources

- [*Blood Parliament*](https://www.youtube.com/watch?v=qz0f1yyf_eA), BBC Africa Eye documentary, 2025
- ["They aimed to kill": BBC identifies security forces who shot Kenya anti-tax protesters](https://www.bbc.com/news/articles/c8jexr9yv0do), BBC, 28 Apr 2025
- [Pressure mounts to probe Kenya police and army after BBC exposé](https://www.bbc.com/news/articles/cy9vrz4q1v8o), BBC, 29 Apr 2025
- [The Kenya June 25, 2024 internet disruption: subsea cable cut or shutdown?](https://ioda.inetintel.cc.gatech.edu/reports/the-kenya-june-25-2024-internet-disruption-subsea-cable-cut-or-shutdown/), IODA, Georgia Tech, May 2025
- [#KeepItOn throughout protests in Kenya](https://www.accessnow.org/press-release/kenya-protests-internet-shutdown/), Access Now, 25 Jun 2024
- [16 dead in anniversary protests](https://www.cnn.com/2025/06/25/africa/kenya-anti-tax-anniversary-protests-intl), CNN / Amnesty Kenya, 25 Jun 2025
- [Kenya's repression deepens](https://monitor.civicus.org/explore/kenyas-repression-deepens-65-more-killed-in-protests-blogger-tortured-killed/), CIVICUS Monitor, Aug 2025
- [Two years on, Kenyan families still seek justice](https://www.aljazeera.com/news/2026/6/25/two-years-on-kenyan-families-still-seek-justice-after-gen-z-protests), Al Jazeera, 25 Jun 2026
- [Families lay flowers on barbed wire on anniversary of deadly Kenya protests](https://www.bbc.com/news/articles/cgqjl8kj8wpo), BBC, 25 Jun 2026

## Credits and licence

The findings belong to the BBC Africa Eye team: filmed, produced and directed by Bertram Hill; executive producer Pete Murimi; film editors Valeria Cardi and Emile Costard; investigators Victoria Arakelyan, Courtney Bembridge, Rüzgar Mehmet Akgün and Regan Wharton; 3D design by Martyna Marciniak. With thanks to the photojournalists who cannot be credited for their own safety.

The **code** is released under the [MIT licence](LICENSE). The **footage, stills, map data and vendored libraries are not**. They belong to their owners and keep their own terms; see [`NOTICE.md`](NOTICE.md).

*In memory of David Chege, Ericsson Mutisya, Eric Shieni, and everyone killed, disappeared and injured in Kenya's protests since June 2024. Haki.*

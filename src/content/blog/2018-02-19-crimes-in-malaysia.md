---
title: "Visualization of Total Accidents in Malaysia"
date: 2018-02-19
description: "This choropleth map about road accidents in Malaysia was coded using D3.js as part of fulfilling the Data Visualization course in Multimedia University."
---

<p class="intro"><span class="dropcap">J</span>avascript is definitely not my strong suit.</p>
<p>Most of the code was adopted from <a href="http://bl.ocks.org/tomschulze/961d57bd1bbd2a9ef993f2e8645cb8d2">this example</a> where I removed some unnecessary code and added projection code for projecting the Malaysia map instead of the world map. Accidents data was retrieved from <a href="http://www.data.gov.my/data/en_US/dataset/statistik-kemalangan-jalan-raya-mengikut-jenis-kemalangan-dan-kecederaan">this link</a> and I structured the necessary data into a JSON file. The map data for Malaysia was provided as part of the assignment but changes were made to the TopoJSON to include the ID of the states so that the accidents data and the map data can be merged. Not much change can be seen from the colours of the choropleth map because the trend for the number of accidents of each state remains constant throughout the years.</p>
<figure class="legacy-frame">
  <iframe src="/legacy/dataviza3.html" title="Malaysia accidents visualization" loading="lazy"></iframe>
  <figcaption>Legacy interactive/output embed. <a href="/legacy/dataviza3.html">Open full page</a></figcaption>
</figure>

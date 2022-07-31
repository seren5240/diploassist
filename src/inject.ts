(async function () {
  let doNotRerenderTopshare = false;

  function getCoordinates(terr): Coordinate {
    return territories[terr].unit_center;
  }

  function render() {
    // Clean up old lines
    d3.selectAll('.diploassist').remove();

    const orders = d3.select("#orders-text");

    // fail fast on other pages
    if (orders.empty()) {
      return;
    }

    const convoys = orders.text().matchAll(/(\w{3}) C (\w{3}) - (\w{3})(?:\W+[SF])?/gi);

    for (const convoy of convoys) {
      const status = convoy[4] || "S";
      const fail = status === "F";
      addConvoy(getCoordinates(convoy[1]), getCoordinates(convoy[2]), getCoordinates(convoy[3]), fail);
    }
  }

  render();
  
  d3.select("#info").on("DOMSubtreeModified", function() {
    if (doNotRerenderTopshare) {
      return;
    }

    const players: RegExpMatchArray[] = getPlayers();

    if (!players.length) {
      return;
    }

    loadTopshares(players);
    doNotRerenderTopshare = true;
  })

  // Listen for changes to the orders text
  d3.select("#orders-text").on("DOMSubtreeModified", function () {
    render();
  });
})();

(function () {
  function addConvoy(unit, from, to, failed) {
    var f = unit;
    var v = from;
    var E = to;
    var l = (v.x + E.x) / 2, r = (v.y + E.y) / 2, u = (3 * v.x + E.x) / 4, k = (3 * v.y + E.y) / 4, O = (v.x + 3 * E.x) / 4;
    h = (v.y + 3 * E.y) / 4;
    if (E.x > v.x) {
      var t = .05 * (E.y - v.y);
      v = .05 * (v.x - E.x);
    } else t = .05 * (v.y - E.y), v = .05 * (E.x - v.x);
    f = ["M", f.x, ",", f.y, "C", l, ",", r, " ", u + t, ",", k + v, " ", O, ",", h].join("");

    d3.select("svg")
      .append('path')
      .attr('d', f)
      .attr('stroke', failed ? '#ff0000' : '#000000')
      .attr('stroke-width', '2')
      .attr('stroke-dasharray', '10,10')
      .attr('fill', 'none');
  }

  function getCoordinates(terr) {
    return territories[terr].unit_center;
  }

  function render() {
    // Remove existing convoy paths
    // const paths = d3.selectAll("path[stroke-width='2'][fill='none'][stroke='#000000']")
    //   .filter((p, i, nodes) => {
    //     const path = d3.select(nodes[i]);
    //     const d = path.attr("d");
    //     const coords = d.split(",");
    //     return coords.length == 10;
    //   })
    //   .remove();

    const orders = d3.select("#orders-text").text();
    const convoys = orders.matchAll(/(\w{3}) C (\w{3}) - (\w{3})(?:\W+(S|F))?/gi);

    for (const convoy of convoys) {
      const status = convoy[4] || "S";
      const fail = status == "F";
      addConvoy(getCoordinates(convoy[1]), getCoordinates(convoy[2]), getCoordinates(convoy[3]), fail);
    }
  }

  render();

  // Listen for changes to the orders text
  d3.select("#orders-text").on("DOMSubtreeModified", function () {
    render();
  });
})();

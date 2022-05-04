(function() {

	const paths = $("path[stroke-width='2'][fill='none'][stroke='#000000']");
  console.log("paths", paths);
  paths.each(function(i) {
    const path = $(this);
    const d = path.attr("d");
    const coords = d.split(",");
    if (coords.length != 10) {
      // This is not a convoy
      return;
    }

    path.hide();
    console.log("hide", path);
  });

})();

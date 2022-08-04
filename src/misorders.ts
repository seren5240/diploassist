function getCenterOfOriginFromOriginRegexArray(origin: string[]) {
  if (!origin[1]) {
    return territories[origin[0]].unit_center;
  }

  const coast: Coordinate =
    territories[origin[0]].coasts[origin[1].substring(1)];
  return { x: coast.x + 6, y: coast.y + 8 };
}

function getCenterOfDestinationFromDestinationRegexArray(
  destination: string[]
) {
  if (!destination[1]) {
    return territories[destination[0]].unit_center;
  }

  return territories[destination[0]].coasts[destination[1].substring(1)];
}

function calculatePathsFromUnitCenters(
  centerOfOrigin: Coordinate,
  centerOfDestination: Coordinate
): string[] {
  const b = Math.atan2(
      centerOfDestination.y - centerOfOrigin.y,
      centerOfDestination.x - centerOfOrigin.x
    ),
    f = centerOfDestination.x - 10 * Math.cos(b),
    v = centerOfDestination.y - 10 * Math.sin(b),
    m = centerOfDestination.x - 22 * Math.cos(b + 0.2),
    d = centerOfDestination.y - 22 * Math.sin(b + 0.2),
    l = centerOfDestination.x - 22 * Math.cos(b - 0.2);
  const destinationYCoordinate = centerOfDestination.y - 22 * Math.sin(b - 0.2);
  const movePath = [
    "M",
    centerOfOrigin.x + 10 * Math.cos(b),
    ",",
    centerOfOrigin.y + 10 * Math.sin(b),
    "L",
    f,
    ",",
    v,
  ].join("");
  const arrowheadPath: string = [
    "M",
    f,
    ",",
    v,
    "L",
    m,
    ",",
    d,
    "L",
    l,
    ",",
    destinationYCoordinate,
    "Z",
  ].join("");
  return [movePath, arrowheadPath];
}

function generatePathsOfMisorder(misorder: RegExpMatchArray): string[] {
  const centerOfOrigin = getCenterOfOriginFromOriginRegexArray(
    misorder.slice(1, 3)
  );
  const centerOfDestination = getCenterOfDestinationFromDestinationRegexArray(
    misorder.slice(3, 5)
  );

  return calculatePathsFromUnitCenters(centerOfOrigin, centerOfDestination);
}

function colorMisorderRed(misorderPaths: string[]): void {
  d3.select("svg")
    .selectAll("path")
    .filter(function () {
      return d3.select(this).attr("d") == misorderPaths[0];
    })
    .attr("stroke", "#ff0000");

  d3.select("svg")
    .selectAll("path")
    .filter(function () {
      return d3.select(this).attr("d") == misorderPaths[1];
    })
    .attr("stroke", "#ff0000")
    .attr("fill", "#ff0000");
}

function isTerritoryLand(terr: string): boolean {
  return territories[terr].type === "l";
}

function isTerritoryWater(terr: string): boolean {
  return !isTerritoryLand(terr);
}

function doesTerritoryBorderWater(terr: string): boolean {
  return !!Object.keys(territories[terr].w_neighbors).length;
}

function isOrderBetweenCoastalTerritories(
  origin: string,
  destination: string
): boolean {
  return (
    isTerritoryLand(origin) &&
    isTerritoryLand(destination) &&
    doesTerritoryBorderWater(origin) &&
    doesTerritoryBorderWater(destination)
  );
}

function getValidPathsForFleetOnLand(origin: string): Record<string, number> {
  return {
    ...territories[origin].w_neighbors,
    ...Object.keys(territories[origin].l_neighbors).filter((x) =>
      isOrderBetweenCoastalTerritories(origin, x)
    ),
  };
}

function getValidPathsForFleetWhenCoastsAreIrrelevant(
  origin: string
): Record<string, number> {
  return isTerritoryWater(origin)
    ? { ...territories[origin].l_neighbors, ...territories[origin].w_neighbors }
    : getValidPathsForFleetOnLand(origin);
}

function getValidPathsWhenCoastsAreIrrelevant(
  origin: string,
  isArmy: boolean
): Record<string, number> {
  return isArmy
    ? territories[origin].l_neighbors
    : getValidPathsForFleetWhenCoastsAreIrrelevant(origin);
}

function getValidPathsForCoastalFleet(
  origin: string,
  isSouthCoast: boolean
): Record<string, number> {
  return isSouthCoast
    ? territories[origin].w_neighbors.sc
    : territories[origin].w_neighbors.nc || territories[origin].w_neighbors.ec;
}

function checkMoveOrderForMisorder(moveOrder: RegExpMatchArray): void {
  const isArmy: boolean = moveOrder[0][0] === "A";
  const origin: string[] = moveOrder.slice(1, 3);
  const destination: string = [moveOrder[3], moveOrder[4]]
    .join("")
    .replace("/", "");
  let validPaths: Record<string, number>;

  if (isArmy && isOrderBetweenCoastalTerritories(origin[0], destination)) {
    return;
  }

  if (!origin[1]) {
    validPaths = getValidPathsWhenCoastsAreIrrelevant(origin[0], isArmy);
  } else {
    validPaths = getValidPathsForCoastalFleet(origin[0], origin[1] === "/sc");
  }

  if (!(destination in validPaths)) {
    const pathsOfMisorder = generatePathsOfMisorder(moveOrder);
    colorMisorderRed(pathsOfMisorder);
  }
}

function checkSupportOrderForMisorder(supportOrder: RegExpMatchArray): void {
  // fail if: destination territory unreachable by supporting unit
  // fail if: supported move path is invalid move order
  const isArmy: boolean = supportOrder[0][0] === "A";
  const centerOfSupportingUnit: Coordinate =
    territories[supportOrder[1]].unit_center;
  console.log(supportOrder);
}

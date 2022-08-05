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

function calculateMovePathsFromUnitCenters(
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

function generatePathsOfMoveMisorder(misorder: RegExpMatchArray): string[] {
  const centerOfOrigin = getCenterOfOriginFromOriginRegexArray(
    misorder.slice(1, 3)
  );
  const centerOfDestination = getCenterOfDestinationFromDestinationRegexArray(
    misorder.slice(3, 5)
  );

  return calculateMovePathsFromUnitCenters(centerOfOrigin, centerOfDestination);
}

function colorMoveMisorderRed(misorderPaths: string[]): void {
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

function getValidPathsFromOrigin(
  origin: string[],
  isArmy: boolean
): Record<string, number> {
  if (!origin[1]) {
    return getValidPathsWhenCoastsAreIrrelevant(origin[0], isArmy);
  }
  return getValidPathsForCoastalFleet(origin[0], origin[1] === "/sc");
}

function checkMoveOrderForMisorder(moveOrder: RegExpMatchArray): void {
  const isArmy: boolean = moveOrder[0][0] === "A";
  const origin: string[] = moveOrder.slice(1, 3);
  const destination: string = [moveOrder[3], moveOrder[4]]
    .join("")
    .replace("/", "");

  if (isArmy && isOrderBetweenCoastalTerritories(origin[0], destination)) {
    return;
  }

  const validPaths = getValidPathsFromOrigin(origin, isArmy);

  if (!(destination in validPaths)) {
    const pathsOfMisorder = generatePathsOfMoveMisorder(moveOrder);
    colorMoveMisorderRed(pathsOfMisorder);
  }
}

function generatePathOfSupportHoldMisorder(
  supportOrder: RegExpMatchArray
): string {
  const centerOfSupportedUnit = getCenterOfOriginFromOriginRegexArray(
    supportOrder.slice(3, 5)
  );

  const centerOfSupportingUnit = getCenterOfOriginFromOriginRegexArray(
    supportOrder.slice(1, 3)
  );

  const offset = Math.atan2(
    centerOfSupportedUnit.y - centerOfSupportingUnit.y,
    centerOfSupportedUnit.x - centerOfSupportingUnit.x
  );

  return [
    "M",
    centerOfSupportingUnit.x + 10 * Math.cos(offset),
    ",",
    centerOfSupportingUnit.y + 10 * Math.sin(offset),
    "L",
    centerOfSupportedUnit.x - 10 * Math.cos(offset),
    ",",
    centerOfSupportedUnit.y - 10 * Math.sin(offset),
  ].join("");
}

function colorSupportHoldMisorderRed(misorderPath: string): void {
  d3.select("svg")
    .selectAll("path")
    .filter(function () {
      return d3.select(this).attr("d") == misorderPath;
    })
    .attr("stroke", "#ff0000");
}

function checkSupportHoldOrderForMisorder(
  supportOrder: RegExpMatchArray
): void {
  const isArmy: boolean = supportOrder[0][0] === "A";
  const origin: string[] = supportOrder.slice(1, 3);
  const destination: string = [supportOrder[3], supportOrder[4]]
    .join("")
    .replace("/", "");

  const validPaths = getValidPathsFromOrigin(origin, isArmy);

  if (!(destination.substring(0, 3) in validPaths)) {
    const misorderPath = generatePathOfSupportHoldMisorder(supportOrder);
    colorSupportHoldMisorderRed(misorderPath);
  }
}

function checkSupportOrderForMisorder(supportOrder: RegExpMatchArray): void {
  const isSupportMove: boolean = !!supportOrder[5];

  if (isSupportMove) {
    return;
  }
  checkSupportHoldOrderForMisorder(supportOrder);
}

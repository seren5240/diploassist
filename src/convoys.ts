function addConvoy(
  centerOfConvoyingUnit: Coordinate,
  centerOfConvoyedUnit: Coordinate,
  centerOfConvoyDestination: Coordinate,
  didConvoyFail: boolean
): void {
  const convoy = new ConvoyAssist(
    centerOfConvoyingUnit,
    centerOfConvoyedUnit,
    centerOfConvoyDestination,
    didConvoyFail
  );

  convoy.drawConvoyAssistPath();
}

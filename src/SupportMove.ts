class SupportMove {
  private convoyingUnit: Coordinate;
  private midpoint: Coordinate;
  private quarterPoint: Coordinate;
  private threeQuartersPoint: Coordinate;
  private xInflectionIncrement: number;
  private yInflectionIncrement: number;

  constructor(
    centerOfConvoyingUnit: Coordinate,
    centerOfConvoyedUnit: Coordinate,
    centerOfConvoyDestination: Coordinate
  ) {
    this.convoyingUnit = centerOfConvoyingUnit;
    this.midpoint = {
      x: (centerOfConvoyedUnit.x + centerOfConvoyDestination.x) / 2,
      y: (centerOfConvoyedUnit.y + centerOfConvoyDestination.y) / 2,
    };
    this.quarterPoint = {
      x: (3 * centerOfConvoyedUnit.x + centerOfConvoyDestination.x) / 4,
      y: (3 * centerOfConvoyedUnit.y + centerOfConvoyDestination.y) / 4,
    };
    this.threeQuartersPoint = {
      x: (centerOfConvoyedUnit.x + 3 * centerOfConvoyDestination.x) / 4,
      y: (centerOfConvoyedUnit.y + 3 * centerOfConvoyDestination.y) / 4,
    };
    [this.xInflectionIncrement, this.yInflectionIncrement] =
      this.setConvoyHelperInflectionIncrement(
        centerOfConvoyedUnit,
        centerOfConvoyDestination
      );
  }

  private setConvoyHelperInflectionIncrement(
    centerOfConvoyedUnit: Coordinate,
    centerOfConvoyDestination: Coordinate
  ): [number, number] {
    if (centerOfConvoyDestination.x > centerOfConvoyedUnit.x) {
      return [
        0.05 * (centerOfConvoyDestination.y - centerOfConvoyedUnit.y),
        0.05 * (centerOfConvoyedUnit.x - centerOfConvoyDestination.x),
      ];
    } else {
      return [
        0.05 * (centerOfConvoyedUnit.y - centerOfConvoyDestination.y),
        0.05 * (centerOfConvoyDestination.x - centerOfConvoyedUnit.x),
      ];
    }
  }

  public getSupportMoveAssistPath(): string {
    return [
      "M",
      this.convoyingUnit.x,
      ",",
      this.convoyingUnit.y,
      "C",
      this.midpoint.x,
      ",",
      this.midpoint.y,
      " ",
      this.quarterPoint.x + this.yInflectionIncrement,
      ",",
      this.quarterPoint.y + this.xInflectionIncrement,
      " ",
      this.threeQuartersPoint.x,
      ",",
      this.threeQuartersPoint.y,
    ].join("");
  }

  public getSupportMoveAssistCircleCenter(): Coordinate {
    return this.threeQuartersPoint;
  }

  public colorSupportMoveMisorderRed(): void {
    const misorderPath = this.getSupportMoveAssistPath();

    d3.select("svg")
      .selectAll("path")
      .filter(function () {
        return (
          // Backstabbr applies additional transformation to support move paths after the extracted code
          d3.select(this).attr("d").substring(0, 15) ===
          misorderPath.substring(0, 15)
        );
      })
      .attr("stroke", "#ff0000");

    const self: SupportMove = this;

    d3.select("svg")
      .selectAll("circle")
      .filter(function () {
        return (
          d3.select(this).attr("cx") === self.threeQuartersPoint.x.toString() &&
          d3.select(this).attr("cy") === self.threeQuartersPoint.y.toString()
        );
      })
      .attr("stroke", "#ff0000");
  }
}

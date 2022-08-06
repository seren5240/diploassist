class OrderAssist {
  private assistingUnit: Coordinate;
  private midpoint: Coordinate;
  private quarterPoint: Coordinate;
  protected threeQuartersPoint: Coordinate;
  private xInflectionIncrement: number;
  private yInflectionIncrement: number;

  constructor(
    centerOfAssistingUnit: Coordinate,
    centerOfAssistedUnit: Coordinate,
    centerOfAssistDestination: Coordinate
  ) {
    this.assistingUnit = centerOfAssistingUnit;
    this.midpoint = {
      x: (centerOfAssistedUnit.x + centerOfAssistDestination.x) / 2,
      y: (centerOfAssistedUnit.y + centerOfAssistDestination.y) / 2,
    };
    this.quarterPoint = {
      x: (3 * centerOfAssistedUnit.x + centerOfAssistDestination.x) / 4,
      y: (3 * centerOfAssistedUnit.y + centerOfAssistDestination.y) / 4,
    };
    this.threeQuartersPoint = {
      x: (centerOfAssistedUnit.x + 3 * centerOfAssistDestination.x) / 4,
      y: (centerOfAssistedUnit.y + 3 * centerOfAssistDestination.y) / 4,
    };
    [this.xInflectionIncrement, this.yInflectionIncrement] =
      this.setInflectionIncrement(
        centerOfAssistedUnit,
        centerOfAssistDestination
      );
  }

  private setInflectionIncrement(
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

  protected getAssistPath(): string {
    return [
      "M",
      this.assistingUnit.x,
      ",",
      this.assistingUnit.y,
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
}

class SupportMove extends OrderAssist {
  constructor(
    centerOfAssistingUnit: Coordinate,
    centerOfAssistedUnit: Coordinate,
    centerOfAssistDestination: Coordinate
  ) {
    super(
      centerOfAssistingUnit,
      centerOfAssistedUnit,
      centerOfAssistDestination
    );
  }

  public colorSupportMoveMisorderRed(): void {
    const misorderPath = this.getAssistPath();

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

class ConvoyAssist extends OrderAssist {
  private didConvoyFail: boolean;

  constructor(
    centerOfAssistingUnit: Coordinate,
    centerOfAssistedUnit: Coordinate,
    centerOfAssistDestination: Coordinate,
    didConvoyFail: boolean
  ) {
    super(
      centerOfAssistingUnit,
      centerOfAssistedUnit,
      centerOfAssistDestination
    );
    this.didConvoyFail = didConvoyFail;
  }

  public drawConvoyAssistPath(): void {
    d3.select("svg")
      .append("path")
      .attr("class", "diploassist")
      .attr("d", this.getAssistPath())
      .attr("stroke", this.didConvoyFail ? "#ff0000" : "#000000")
      .attr("stroke-width", "2")
      .attr("stroke-dasharray", "10,10")
      .attr("fill", "none");
  }
}

class Convoy {
    private convoyingUnit: Coordinate;
    private midpoint: Coordinate;
    private quarterPoint: Coordinate;
    private threeQuartersPoint: Coordinate;
    private didConvoyFail: boolean;
    private xInflectionIncrement: number;
    private yInflectionIncrement: number;

    constructor(
        centerOfConvoyingUnit: Coordinate,
        centerOfConvoyedUnit: Coordinate,
        centerOfConvoyDestination: Coordinate,
        didConvoyFail: boolean
    ) {
        this.convoyingUnit = centerOfConvoyingUnit;
        this.midpoint = {x: (centerOfConvoyedUnit.x + centerOfConvoyDestination.x) / 2, y: (centerOfConvoyedUnit.y + centerOfConvoyDestination.y) / 2};
        this.quarterPoint = {x: (3 * centerOfConvoyedUnit.x + centerOfConvoyDestination.x) / 4, y: (3 * centerOfConvoyedUnit.y + centerOfConvoyDestination.y) / 4};
        this.threeQuartersPoint = {x: (centerOfConvoyedUnit.x + 3 * centerOfConvoyDestination.x) / 4, y: (centerOfConvoyedUnit.y + 3 * centerOfConvoyDestination.y) / 4};
        this.didConvoyFail = didConvoyFail;
        [this.xInflectionIncrement, this.yInflectionIncrement] = this.setConvoyHelperInflectionIncrement(centerOfConvoyedUnit, centerOfConvoyDestination);
    }

    private setConvoyHelperInflectionIncrement(
        centerOfConvoyedUnit: Coordinate,
        centerOfConvoyDestination: Coordinate
      ):[number, number] {
        if (centerOfConvoyDestination.x > centerOfConvoyedUnit.x) {
          return [.05 * (centerOfConvoyDestination.y - centerOfConvoyedUnit.y), 
                 .05 * (centerOfConvoyedUnit.x - centerOfConvoyDestination.x)];
        } else {
          return [.05 * (centerOfConvoyedUnit.y - centerOfConvoyDestination.y),
                  .05 * (centerOfConvoyDestination.x - centerOfConvoyedUnit.x)];
        }
      }

    private getConvoyAssistPath(): string {
        return ["M", this.convoyingUnit.x,
        ",", this.convoyingUnit.y,
        "C", this.midpoint.x,
        ",", this.midpoint.y,
        " ", this.quarterPoint.x + this.yInflectionIncrement, ",", this.quarterPoint.y + this.xInflectionIncrement,
        " ", this.threeQuartersPoint.x, ",", this.threeQuartersPoint.y].join("");
    }

    public drawConvoyAssistPath(): void {
        d3.select("svg")
        .append('path')
        .attr('class', 'diploassist')
        .attr('d', this.getConvoyAssistPath())
        .attr('stroke', this.didConvoyFail ? '#ff0000' : '#000000')
        .attr('stroke-width', '2')
        .attr('stroke-dasharray', '10,10')
        .attr('fill', 'none');
    }
}

function addConvoy(
    centerOfConvoyingUnit: Coordinate,
    centerOfConvoyedUnit: Coordinate,
    centerOfConvoyDestination: Coordinate,
    didConvoyFail: boolean
): void {
    const convoy = new Convoy(
        centerOfConvoyingUnit,
        centerOfConvoyedUnit,
        centerOfConvoyDestination,
        didConvoyFail
    );

    convoy.drawConvoyAssistPath();
}

import {
  ConsumerSubject,
  DisplayComponent,
  EventBus,
  FSComponent,
  MappedSubject,
  Subscribable,
} from '@microsoft/msfs-sdk';
import { EwdSimvars } from '../shared/EwdSimvarPublisher';

interface AttentionGetterProps {
  bus: EventBus;
  x: number;
  y: number;
  engine: number;
  active: Subscribable<boolean>;
}

export class AttentionGetter extends DisplayComponent<AttentionGetterProps> {
  private readonly sub = this.props.bus.getSubscriber<EwdSimvars>();

  private readonly engine1N1 = ConsumerSubject.create(this.sub.on('engine1N1').withPrecision(1).whenChanged(), 0);
  private readonly engine2N1 = ConsumerSubject.create(this.sub.on('engine2N1').withPrecision(1).whenChanged(), 0);

  private readonly engine1State = ConsumerSubject.create(this.sub.on('engine1State').whenChanged(), 0);
  private readonly engine2State = ConsumerSubject.create(this.sub.on('engine2State').whenChanged(), 0);

  private readonly n1Idle = ConsumerSubject.create(this.sub.on('idleN1').withPrecision(1).whenChanged(), 0);

  private readonly visible1 = MappedSubject.create(
    ([active, n1, idleN1, state]) => active && !!(n1 < Math.floor(idleN1) - 1 && state === 2),
    this.props.active,
    this.engine1N1,
    this.n1Idle,
    this.engine1State,
  );

  private readonly visible2 = MappedSubject.create(
    ([active, n1, idleN1, state]) => active && !!(n1 < Math.floor(idleN1) - 1 && state === 2),
    this.props.active,
    this.engine2N1,
    this.n1Idle,
    this.engine2State,
  );

  render() {
    return (
      <g
        id={`attention-getter-${this.props.engine}`}
        visibility={MappedSubject.create(([v1, v2]) => v1 || v2, this.visible1, this.visible2).map((it) =>
          it ? 'inherit' : 'hidden',
        )}
      >
        <path class="WhiteLine" d={`m ${this.props.x - 74} ${this.props.y - 13} l 0,-72 l 162,0 l 0,72`} />
        <path class="WhiteLine" d={`m ${this.props.x - 74} ${this.props.y + 224} l 0,72 l 162,0 l 0,-72`} />
      </g>
    );
  }
}
